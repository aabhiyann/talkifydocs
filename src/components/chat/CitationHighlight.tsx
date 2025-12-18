"use client";

import { useEffect } from "react";

type Citation = {
  source?: number;
  fileId?: string;
  page?: number;
  snippet?: string;
};

type MessageWithCitations = {
  id: string;
  content: string;
  citations?: Citation[];
};

type PdfViewerRef = {
  navigateToPage?: (page: number) => void;
  highlightText?: (snippet: string) => void;
};

/**
 * Optional hook to drive PDF highlighting from inline `[Source N]` markers
 * in a chat message. This assumes the PDF viewer exposes imperative methods
 * via `pdfViewerRef` (navigateToPage/highlightText). Our current viewer
 * uses props instead, so this is a non-breaking enhancement hook that can
 * be wired up later if needed.
 */
export function useCitationHighlight(
  message: MessageWithCitations,
  pdfViewerRef: React.RefObject<PdfViewerRef | null>,
) {
  useEffect(() => {
    if (!message?.content || !Array.isArray(message.citations)) return;

    const pattern = /\[Source\s+(\d+)\]/gi;
    const matches = [...message.content.matchAll(pattern)];

    if (matches.length === 0) return;

    const indexes = matches
      .map((m) => {
        const idx = parseInt(m[1], 10);
        return Number.isNaN(idx) ? null : idx - 1;
      })
      .filter((n) => n !== null && n >= 0) as number[];

    indexes.forEach((i) => {
      const citation = message.citations?.[i];
      if (!citation) return;

      const viewer = pdfViewerRef.current;
      if (!viewer) return;

      if (typeof citation.page === "number" && viewer.navigateToPage) {
        viewer.navigateToPage(citation.page);
      }

      if (citation.snippet && viewer.highlightText) {
        viewer.highlightText(citation.snippet);
      }
    });
  }, [message, pdfViewerRef]);
}
