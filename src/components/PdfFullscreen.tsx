import React, { useState, useEffect, ComponentType } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import type { DocumentProps, PageProps } from "react-pdf";
import { logger } from "@/lib/logger";

interface PdfFullscreenProps {
  fileUrl: string;
}

const PdfFullscreen = ({ fileUrl }: PdfFullscreenProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>();
  const [DocumentComponent, setDocumentComponent] = useState<ComponentType<DocumentProps> | null>(null);
  const [PageComponent, setPageComponent] = useState<ComponentType<PageProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  // Load PDF components dynamically
  useEffect(() => {
    const loadPdfComponents = async () => {
      try {
        const { Document, Page } = await import("react-pdf");
        setDocumentComponent(() => Document);
        setPageComponent(() => Page);
        setIsLoading(false);
      } catch (error) {
        logger.error("Failed to load PDF components:", error);
        setIsLoading(false);
        toast({
          title: "Error loading PDF viewer",
          description: "Failed to load PDF viewer for fullscreen mode.",
          variant: "destructive",
        });
      }
    };

    loadPdfComponents();
  }, [toast]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button aria-label="fullscreen" className="gap-1.5" variant="ghost">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-7xl">
        <SimpleBar autoHide={false} className="mt-6 max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary-600" />
                <p className="text-sm text-muted-foreground">Loading PDF viewer...</p>
              </div>
            ) : DocumentComponent && PageComponent ? (
              <DocumentComponent
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onLoadError={() => {
                  toast({
                    title: "Error in loading PDF",
                    description: "Please try again to upload PDF",
                    variant: "destructive",
                  });
                }}
                onLoadSuccess={({ numPages }: { numPages: number }) => {
                  setNumPages(numPages);
                }}
                file={fileUrl}
                className="max-h-full"
              >
                {numPages &&
                  new Array(numPages)
                    .fill(0)
                    .map((_, i) => <PageComponent key={i} width={width ? width : 1} pageNumber={i + 1} />)}
              </DocumentComponent>
            ) : (
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
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Failed to load PDF viewer
                </h3>
                <p className="text-center text-sm text-muted-foreground">
                  There was an error loading the PDF viewer for fullscreen mode.
                </p>
              </div>
            )}
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullscreen;
