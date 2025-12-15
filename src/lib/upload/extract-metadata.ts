import { PDFDocument } from "pdf-lib";
import pdf from "pdf-parse";

export type ExtractedPdfMetadata = {
  pageCount: number;
  author: string | null;
  title: string | null;
  creationDate: string | null;
  modificationDate: string | null;
  wordCount: number;
  raw?: Record<string, any> | null;
};

/**
 * Extracts metadata such as page count, author, title, and word count from a PDF URL.
 */
export async function extractMetadata(pdfUrl: string): Promise<ExtractedPdfMetadata> {
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download PDF for metadata: ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Parse with pdf-parse
  const data = await pdf(buffer);

  const info = (data as any).info || {};

  const pageCount = typeof data.numpages === "number" ? data.numpages : 0;
  const author = info.Author || null;
  const title = info.Title || null;
  const creationDate = info.CreationDate || null;
  const modificationDate = info.ModDate || null;
  const text: string = data.text || "";
  const wordCount = text.split(/\s+/).filter((word) => Boolean(word && word.trim())).length;

  return {
    pageCount,
    author,
    title,
    creationDate,
    modificationDate,
    wordCount,
    raw: info,
  };
}
