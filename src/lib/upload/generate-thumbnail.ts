import { put } from "@vercel/blob";

export type GenerateThumbnailParams = {
  fileId: string;
  fileUrl: string;
};

/**
 * Generate a simple SVG-based thumbnail for a PDF and upload it to Vercel Blob.
 *
 * NOTE: This is a lightweight implementation that does not actually render the
 * PDF contents. It creates a branded placeholder thumbnail that can be improved
 * later (e.g. by rendering the first page server-side).
 */
export async function generatePdfThumbnail({
  fileId,
  fileUrl,
}: GenerateThumbnailParams): Promise<string | null> {
  try {
    const safeLabel = fileUrl
      ? new URL(fileUrl).pathname.split("/").pop() ?? "PDF"
      : "PDF";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f766e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" rx="32" ry="32"/>
  <text x="50%" y="45%" text-anchor="middle" fill="#ffffff" font-size="64" font-family="system-ui" font-weight="700">PDF</text>
  <text x="50%" y="60%" text-anchor="middle" fill="#e5e7eb" font-size="24" font-family="system-ui">
    ${safeLabel.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
  </text>
</svg>`;

    const blob = await put(`thumbnails/${fileId}.svg`, svg, {
      access: "public",
      contentType: "image/svg+xml",
    });

    return blob.url;
  } catch (error) {
    console.warn("[upload] Failed to upload thumbnail to Vercel Blob:", error);
    return null;
  }
}


