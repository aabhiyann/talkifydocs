"use client";

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { useToast } from "./ui/use-toast";

import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import dynamic from "next/dynamic";

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

// Dynamically import PDF components to avoid SSR issues
const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-4" />
      <p className="text-sm text-muted-foreground">Loading PDF viewer...</p>
    </div>
  ),
});

const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});


interface PdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();

  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);

  const isLoading = renderedScale !== scale || !pdfjsLib;

  // Load PDF.js library and CSS on client side
  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        // Import PDF.js library
        const pdfjs = await import('pdfjs-dist');
        setPdfjsLib(pdfjs);
        
        // Configure worker with fallback options
        const workerSources = [
          `${window.location.origin}/pdf.worker.min.js`,
          `https://unpkg.com/pdfjs-dist@5.3.93/build/pdf.worker.min.js`,
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.93/pdf.worker.min.js`
        ];
        
        pdfjs.GlobalWorkerOptions.workerSrc = workerSources[0];
        
        // Test worker availability
        try {
          const response = await fetch(workerSources[0], { method: 'HEAD' });
          if (!response.ok) {
            throw new Error('Local worker not available');
          }
        } catch (error) {
          console.warn('Local worker failed, trying CDN fallback...');
          pdfjs.GlobalWorkerOptions.workerSrc = workerSources[1];
        }
        
        // Import CSS dynamically
        await import('react-pdf/dist/Page/AnnotationLayer.css');
        await import('react-pdf/dist/Page/TextLayer.css');
      } catch (error) {
        console.error('Failed to load PDF.js:', error);
        toast({
          title: "Error loading PDF viewer",
          description: "Failed to load PDF viewer library. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadPdfjs();
  }, [toast]);

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
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

  const { width, ref } = useResizeDetector();

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page));
    setValue("page", String(page));
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-gray-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            aria-label="previous page"
            variant="ghost"
            disabled={currPage <= 1}
            onClick={() => {
              setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              setValue("page", String(currPage - 1));
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />

            <p className="text-gray-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            aria-label="next page"
            variant="ghost"
            disabled={numPages === undefined || currPage === numPages}
            onClick={() => {
              setCurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1
              );
              setValue("page", String(currPage + 1));
            }}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="h-4 w-4" />
                {scale * 100}%
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => {
                  setScale(1);
                }}
              >
                100%
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setScale(1.5);
                }}
              >
                150%
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setScale(2);
                }}
              >
                200%
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setScale(2.5);
                }}
              >
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            aria-label="Rotate 90 degrees"
            variant="ghost"
            onClick={() => {
              setRotation((prev) => prev + 90);
            }}
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <PdfFullscreen fileUrl={url} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-4" />
                  <p className="text-sm text-muted-foreground">Loading PDF...</p>
                </div>
              }
              onLoadError={(error) => {
                console.error('PDF loading error:', error);
                toast({
                  title: "Error loading PDF",
                  description: "Failed to load PDF document. Please try refreshing the page.",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
              }}
              file={url}
              className="max-h-full"
              error={
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-destructive mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load PDF</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    There was an error loading the PDF document. This might be due to a network issue or an unsupported file format.
                  </p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                    size="sm"
                  >
                    Refresh Page
                  </Button>
                </div>
              }
            >
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currPage}
                  scale={scale}
                  rotate={rotation}
                  key={"@" + renderedScale}
                />
              ) : null}

              <Page
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => {
                  setRenderedScale(scale);
                }}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
