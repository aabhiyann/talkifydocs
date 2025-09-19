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

interface PdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);
  const [Document, setDocument] = useState<any>(null);
  const [Page, setPage] = useState<any>(null);

  const isLoadingPdf = isLoading || renderedScale !== scale || !pdfjsLib || !Document || !Page;

  // Load PDF.js library and components on client side
  useEffect(() => {
    const loadPdfComponents = async () => {
      try {
        setIsLoading(true);
        
        // Import PDF.js library
        const pdfjs = await import('pdfjs-dist');
        setPdfjsLib(pdfjs);
        
        // Configure worker with a simple, reliable approach
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
        
        // Import react-pdf components
        const { Document: DocumentComponent, Page: PageComponent } = await import('react-pdf');
        setDocument(() => DocumentComponent);
        setPage(() => PageComponent);
        
        // Import CSS
        await import('react-pdf/dist/Page/AnnotationLayer.css');
        await import('react-pdf/dist/Page/TextLayer.css');
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load PDF components:', error);
        setIsLoading(false);
        toast({
          title: "Error loading PDF viewer",
          description: "Failed to load PDF viewer. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadPdfComponents();
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

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page));
    setValue("page", String(page));
  };

  const handlePageChange = (direction: "up" | "down") => {
    if (direction === "up") {
      setCurrPage((prev) => (prev + 1 > numPages! ? numPages! : prev + 1));
      setValue("page", String(currPage + 1));
    } else {
      setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
      setValue("page", String(currPage - 1));
    }
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

  const onDocumentLoadError = (error: any) => {
    console.error('PDF document load error:', error);
    toast({
      title: "Error loading PDF",
      description: "Failed to load PDF document. Please try again.",
      variant: "destructive",
    });
  };

  const onPageLoadSuccess = () => {
    setRenderedScale(scale);
  };

  if (isLoadingPdf) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-muted-foreground">Loading PDF viewer...</p>
        </div>
      </div>
    );
  }

  if (!Document || !Page) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-destructive">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Failed to load PDF viewer</h3>
          <p className="text-sm text-muted-foreground text-center">
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
    <div className="flex flex-col w-full">
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
            <p className="text-sm text-muted-foreground space-x-1">
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
              <DropdownMenuItem onSelect={() => handleScaleChange(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleScaleChange(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleScaleChange(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleScaleChange(0.5)}>
                50%
              </DropdownMenuItem>
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
              onLoadError={onDocumentLoadError}
              onLoadSuccess={onDocumentLoadSuccess}
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
                  key={`${currPage}-${scale}`}
                  onLoadSuccess={onPageLoadSuccess}
                />
              ) : null}
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;