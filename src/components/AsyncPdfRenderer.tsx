"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the PdfRenderer component
// This ensures code splitting for the heavy PDF libraries
const PdfRenderer = dynamic(() => import("./PdfRenderer").then((m) => m.PdfRenderer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <p className="text-sm text-muted-foreground">Loading PDF viewer...</p>
      </div>
    </div>
  ),
});

interface AsyncPdfRendererProps {
  url: string;
  page?: number;
  onPageChange?: (page: number) => void;
}

export default function AsyncPdfRenderer(props: AsyncPdfRendererProps) {
  return <PdfRenderer {...props} />;
}