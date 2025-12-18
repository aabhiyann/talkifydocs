import { put } from "@vercel/blob";
import sharp from "sharp";

/**
 * Generate a PNG thumbnail for the first page of a PDF and upload it to Vercel Blob.
 *
 * NOTE: This relies on sharp's PDF rendering support. On platforms where PDF
 * rendering is not available, this may throw at runtime; callers should handle
 * errors and treat the thumbnail as optional.
 */
export async function generateThumbnail(pdfUrl: string): Promise<string> {
  // 1. Fetch PDF
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download PDF for thumbnail: ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 2. Render first page and resize with sharp
  // sharp will render the first page of the PDF when given the buffer directly.
  const thumbnailBuffer = await sharp(buffer, { density: 150, pages: 1 })
    .resize(300, 400, { fit: "cover" })
    .png()
    .toBuffer();

  // 3. Upload thumbnail to Vercel Blob
  const blob = await put(`thumbnails/${Date.now()}.png`, thumbnailBuffer, {
    access: "public",
    contentType: "image/png",
  });

  return blob.url;
}
