import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";

interface PdfFullscreenProps {
  fileUrl: string;
}

const PdfFullscreen = ({ fileUrl }: PdfFullscreenProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>();
  const [Document, setDocument] = useState<any>(null);
  const [Page, setPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  // Load PDF components dynamically
  useEffect(() => {
    const loadPdfComponents = async () => {
      try {
        const { Document: DocumentComponent, Page: PageComponent } =
          await import("react-pdf");
        setDocument(() => DocumentComponent);
        setPage(() => PageComponent);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load PDF components:", error);
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

      <DialogContent className="max-w-7xl w-full">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={ref}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Loading PDF viewer...
                </p>
              </div>
            ) : Document && Page ? (
              <Document
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
                    .map((_, i) => (
                      <Page
                        key={i}
                        width={width ? width : 1}
                        pageNumber={i + 1}
                      />
                    ))}
              </Document>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-destructive mb-4">
                  <svg
                    className="h-12 w-12 mx-auto"
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
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Failed to load PDF viewer
                </h3>
                <p className="text-sm text-muted-foreground text-center">
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
