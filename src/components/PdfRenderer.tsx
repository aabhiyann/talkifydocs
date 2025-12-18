"use client";

import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect, type ComponentType } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullscreen from "./PdfFullscreen";
import type * as Pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import type { DocumentProps, PageProps } from "react-pdf";
import { logger } from "@/lib/logger";

interface PdfRendererProps {
  url: string;
  /**
   * Optional externally controlled page number (1-based).
   */
  page?: number;
  /**
   * Callback when the current page changes in the viewer.
   */
  onPageChange?: (page: number) => void;
}

const PdfRenderer = ({ url, page, onPageChange }: PdfRendererProps) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pdfjsLib, setPdfjsLib] = useState<typeof Pdfjs | null>(null);
  const [DocumentComponent, setDocumentComponent] = useState<ComponentType<DocumentProps> | null>(
    null,
  );
  const [PageComponent, setPageComponent] = useState<ComponentType<PageProps> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);

  const isLoadingPdf =
    renderedScale !== scale ||
    !pdfjsLib ||
    !DocumentComponent ||
    !PageComponent ||
    !mounted;

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load PDF.js library and components on client side
  useEffect(() => {
    if (!mounted) return;

    const loadPdfComponents = async () => {
      try {
        setIsLoading(true);

        // Set a timeout to prevent infinite loading
        const timeout = setTimeout(() => {
          setIsLoading(false);
          toast({
            title: "PDF Loading Timeout",
            description: "PDF viewer is taking too long to load. Please refresh the page.",
            variant: "destructive",
          });
        }, 30000); // 30 second timeout

        setLoadTimeout(timeout);

        // Import PDF.js library
        const pdfjs = await import("pdfjs-dist");
        setPdfjsLib(pdfjs);

        // Configure worker with multiple fallback options
        if (typeof window !== "undefined") {
          // Use the worker from the installed package
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
        }

        // Import react-pdf components
        const { Document, Page } = await import("react-pdf");
        setDocumentComponent(() => Document);
        setPageComponent(() => Page);

        // Note: CSS imports are handled by Next.js automatically

        // Clear timeout and set loading to false
        clearTimeout(timeout);
        setLoadTimeout(null);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load PDF components:", error);
        if (loadTimeout) {
          clearTimeout(loadTimeout);
          setLoadTimeout(null);
        }
        setIsLoading(false);
        toast({
          title: "Error loading PDF viewer",
          description: "Failed to load PDF viewer. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadPdfComponents();

    // Cleanup timeout on unmount
    return () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
    };
  }, [mounted, toast, loadTimeout]);

  const CustomPageValidator = z.object({
    page: z.string().refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    const next = Number(page);
    setCurrPage(next);
    setValue("page", String(next));
    onPageChange?.(next);
  };

  const handlePageChange = (direction: "up" | "down") => {
    setCurrPage((prev) => {
      if (!numPages) return prev;
      const next =
        direction === "up"
          ? prev + 1 > numPages
            ? numPages
            : prev + 1
          : prev - 1 > 1
            ? prev - 1
            : 1;
      setValue("page", String(next));
      onPageChange?.(next);
      return next;
    });
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    setRenderedScale(null);
  };

  const handleRotateChange = (newRotation: number) => {
    setRotation(newRotation);
  };

  const onDocumentLoadSuccess = (pdf: any) => {
    setNumPages(pdf.numPages);
    setRenderedScale(scale);
  };

  const onDocumentLoadError = (error: Error) => {
    logger.error("PDF document load error:", error);
    logger.error("PDF URL:", url);
    logger.error("Error details:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });

    // Check for specific error types
    let errorMessage = "Failed to load PDF document.";
    if (error?.name === "InvalidPDFException") {
      errorMessage = "The uploaded file is not a valid PDF or is corrupted.";
    } else if (error?.name === "MissingPDFException") {
      errorMessage = "The PDF file could not be found or accessed.";
    } else if (error?.message?.includes("CORS")) {
      errorMessage = "CORS error: The PDF file cannot be loaded due to security restrictions.";
    } else if (error?.message?.includes("network")) {
      errorMessage = "Network error: Unable to load the PDF file.";
    }

    toast({
      title: "Error loading PDF",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const onPageLoadSuccess = () => {
    setRenderedScale(scale);
  };

  // Sync external page prop into internal state & input
  useEffect(() => {
    if (typeof page !== "number" || page <= 0) return;
    setCurrPage(page);
    setValue("page", String(page));
  }, [page, setValue]);

  if (isLoadingPdf) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-muted-foreground">Loading PDF viewer...</p>
          <p className="text-xs text-muted-foreground">
            {!mounted && "Initializing..."}
            {mounted && !pdfjsLib && "Loading PDF library..."}
            {pdfjsLib && !DocumentComponent && "Loading PDF components..."}
            {DocumentComponent && !PageComponent && "Loading PDF renderer..."}
            {DocumentComponent && PageComponent && "Preparing PDF..."}
          </p>
        </div>
      </div>
    );
  }

  if (!DocumentComponent || !PageComponent) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-destructive">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Failed to load PDF viewer</h3>
          <p className="text-center text-sm text-muted-foreground">
            There was an error loading the PDF viewer. Please refresh the page.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      {/* PDF Controls */}
      <div className="flex items-center justify-between border-b border-border bg-background px-2 py-2">
        <div className="flex items-center gap-2">
          <Button
            disabled={currPage <= 1}
            onClick={() => handlePageChange("down")}
            variant="ghost"
            size="sm"
            aria-label="previous page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={cn("h-8 w-12", errors.page && "focus-visible:ring-red-500")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="space-x-1 text-sm text-muted-foreground">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            disabled={numPages === undefined || currPage >= numPages}
            onClick={() => handlePageChange("up")}
            variant="ghost"
            size="sm"
            aria-label="next page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="h-4 w-4" />
                {scale * 100}%
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleScaleChange(1)}>100%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleScaleChange(1.5)}>150%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleScaleChange(2)}>200%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleScaleChange(0.5)}>50%</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => handleRotateChange(rotation + 90)}
            variant="ghost"
            size="sm"
            aria-label="rotate 90 degrees"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <PdfFullscreen fileUrl={url} />
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-h-screen w-full flex-1">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <DocumentComponent
              loading={
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary-600" />
                  <p className="text-sm text-muted-foreground">Loading PDF...</p>
                </div>
              }
              onLoadError={onDocumentLoadError}
              onLoadSuccess={onDocumentLoadSuccess}
              file={url}
              className="max-h-full"
              error={
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 text-destructive">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">Failed to load PDF</h3>
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    There was an error loading the PDF document. This might be due to a network
                    issue or an unsupported file format.
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    Refresh Page
                  </Button>
                </div>
              }
            >
              {isLoading && renderedScale ? (
                <PageComponent
                  width={width ? width : 1}
                  pageNumber={currPage}
                  scale={scale}
                  rotate={rotation}
                  key={`${currPage}-${scale}`}
                  onLoadSuccess={onPageLoadSuccess}
                />
              ) : null}
            </DocumentComponent>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
