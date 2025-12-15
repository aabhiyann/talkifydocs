import type { Document } from "langchain/document";

export type ExtractedPdfMetadata = {
  pageCount?: number;
  title?: string | null;
  author?: string | null;
  createdAt?: string | null;
  modifiedAt?: string | null;
  summary?: string | null;
  metadata?: Record<string, any> | null;
};

/**
 * Best-effort extraction of basic PDF metadata from LangChain page-level docs.
 * This is intentionally lightweight; you can extend it later with a proper
 * PDF metadata parser or an LLM-based summarizer.
 */
export async function extractPdfMetadata(
  pageLevelDocs: Document[]
): Promise<ExtractedPdfMetadata> {
  if (!pageLevelDocs.length) {
    return { pageCount: 0, metadata: null, summary: null };
    }

  const firstMeta = pageLevelDocs[0].metadata ?? {};

  // Some PDF loaders expose attributes like title/author/creationDate
  const title =
    (firstMeta["Title"] as string | undefined) ??
    (firstMeta["title"] as string | undefined) ??
    null;
  const author =
    (firstMeta["Author"] as string | undefined) ??
    (firstMeta["author"] as string | undefined) ??
    null;
  const createdAt =
    (firstMeta["CreationDate"] as string | undefined) ??
    (firstMeta["created"] as string | undefined) ??
    null;
  const modifiedAt =
    (firstMeta["ModDate"] as string | undefined) ??
    (firstMeta["modified"] as string | undefined) ??
    null;

  // Simple summary: first page truncated to a reasonable length
  const firstPageText = (pageLevelDocs[0].pageContent || "").trim();
  const summary =
    firstPageText.length > 600
      ? `${firstPageText.slice(0, 580).trim()}…`
      : firstPageText || null;

  return {
    pageCount: pageLevelDocs.length,
    title,
    author,
    createdAt,
    modifiedAt,
    summary,
    metadata: firstMeta,
  };
}


