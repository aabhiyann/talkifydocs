import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import type { Document } from "langchain/document";
import { getPineconeIndex } from "./pinecone";

type AnyDocument = Document & {
  metadata: Record<string, any>;
};

// Very simple BM25-style keyword scoring over a small candidate set
function bm25Search(
  query: string,
  documents: AnyDocument[],
  k: number
): AnyDocument[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0 || documents.length === 0) {
    return documents.slice(0, k);
  }

  const scores = documents.map((doc) => {
    const content = (doc.pageContent || "").toLowerCase();
    let score = 0;

    terms.forEach((term) => {
      if (!term) return;
      const freq = (content.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || [])
        .length;
      if (freq > 0) {
        score += freq * Math.log(1 + documents.length / (freq + 1));
      }
    });

    return { doc, score };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.doc);
}

export async function hybridSearch(
  query: string,
  fileIds: string[],
  k: number = 4
): Promise<AnyDocument[]> {
  if (!fileIds || fileIds.length === 0) {
    return [];
  }

  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
  });

  const pineconeIndex = getPineconeIndex();

  // Search across all file namespaces
  const allResults = await Promise.all(
    fileIds.map(async (fileId) => {
      try {
        const vectorStore = await PineconeStore.fromExistingIndex(
          embeddings as any,
          {
            pineconeIndex: pineconeIndex as any,
            namespace: fileId,
          }
        );

        // Get candidates per file (distribute k across files)
        const perFileK = Math.max(1, Math.ceil(k / fileIds.length));
        const results = (await vectorStore.similaritySearch(
          query,
          perFileK * 2
        )) as AnyDocument[];

        // Ensure fileId is in metadata
        return results.map((doc) => ({
          ...doc,
          metadata: {
            ...doc.metadata,
            fileId: doc.metadata?.fileId ?? fileId,
          },
        }));
      } catch (error) {
        console.error(`Error searching namespace ${fileId}:`, error);
        return [];
      }
    })
  );

  // Flatten all results
  const combined = allResults.flat();

  if (combined.length === 0) {
    return [];
  }

  // Rerank with BM25-style keyword scoring across all documents
  const keywordResults = bm25Search(query, combined, k * 2);

  // Combine and deduplicate by fileId + page + content hash
  const seen = new Set<string>();
  const final: AnyDocument[] = [];

  function add(doc: AnyDocument) {
    const key = `${doc.metadata?.fileId ?? ""}::${
      doc.metadata?.page ?? ""
    }::${doc.pageContent.slice(0, 50)}`;
    if (seen.has(key)) return;
    seen.add(key);
    final.push(doc);
  }

  // Prioritize keyword results, then fill with semantic results
  keywordResults.forEach(add);
  combined.forEach(add);

  return final.slice(0, k);
}


