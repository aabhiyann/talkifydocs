"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import {
  Cloud,
  File,
  Files,
  Loader2,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUploadStatusStore } from "@/hooks/useUploadStatus";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const UploadDropzone = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Zustand store for upload management
  const {
    uploads,
    activeUploads,
    addUpload,
    updateUpload,
    removeUpload,
    clearCompleted,
    getAllUploads,
    hasActiveUploads,
  } = useUploadStatusStore();

  const { startUpload } = useUploadThing("pdfUploader");

  const listenForProcessing = useCallback(
    (uploadId: string, fileId: string, fileName: string) => {
      const eventSource = new EventSource(
        `/api/process-upload?fileId=${encodeURIComponent(fileId)}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as {
            status: string;
            file?: {
              id: string;
              name: string;
              uploadStatus: string;
              thumbnailUrl: string | null;
              pageCount: number | null;
              metadata?: Record<string, any> | null;
            };
          };

          if (!data || !data.status) return;

          if (data.status === "NOT_FOUND" || data.status === "ERROR") {
            updateUpload(uploadId, {
              status: "error",
              error:
                data.status === "NOT_FOUND"
                  ? "File not found. Please try uploading again."
                  : "An error occurred while processing the file.",
            });
            eventSource.close();
            return;
          }

          const isSuccess = data.status === "SUCCESS";
          const isFailed = data.status === "FAILED";

          if (isSuccess && data.file) {
            updateUpload(uploadId, {
              status: "success",
              dbFileId: data.file.id,
            });

            const allUploads = getAllUploads();
            if (allUploads.length === 1) {
              setTimeout(() => {
                router.push(`/dashboard/${data.file!.id}`);
              }, 1000);
            } else {
              toast({
                title: "Upload complete",
                description: `${data.file.name} has been processed successfully.`,
              });
            }

            eventSource.close();
            return;
          }

          if (isFailed) {
            updateUpload(uploadId, {
              status: "error",
              dbFileId: data.file?.id,
              error:
                "We couldn't process this file. Please check the file and try again.",
            });
            eventSource.close();
            return;
          }

          // Intermediate processing state
          updateUpload(uploadId, {
            status: "processing",
          });
        } catch (e) {
          console.error("Failed to parse SSE message", e);
        }
      };

      eventSource.onerror = () => {
        console.warn("SSE connection error for upload", uploadId);
        eventSource.close();
      };
    },
    [getAllUploads, router, toast, updateUpload]
  );

  const processFile = useCallback(
    async (uploadId: string, file: File) => {
      try {
        updateUpload(uploadId, { status: "uploading" });

        // Simulate progress
        const progressInterval = setInterval(() => {
          const upload = useUploadStatusStore.getState().getUpload(uploadId);
          if (!upload || upload.status !== "uploading") {
            clearInterval(progressInterval);
            return;
          }
          
          if (upload.progress < 90) {
            updateUpload(uploadId, {
              progress: Math.min(upload.progress + Math.random() * 20, 90),
            });
          }
        }, 300);

        // Start actual upload
        const res = await startUpload([file]);
        clearInterval(progressInterval);

        if (!res || !res[0]) {
          throw new Error("Upload failed");
        }

        const fileResponse = res[0];
        const serverData = (fileResponse as any).serverData as
          | { id: string; name?: string; status?: string }
          | undefined;

        if (!serverData || !serverData.id) {
          throw new Error("Upload completed but no file ID was returned");
        }

        updateUpload(uploadId, {
          status: "processing",
          progress: 100,
        });

        // Start listening for processing status via SSE
        listenForProcessing(
          uploadId,
          serverData.id,
          serverData.name || file.name
        );
      } catch (error) {
        updateUpload(uploadId, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    },
    [startUpload, updateUpload, listenForProcessing]
  );

  const handleDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        let message = "File rejected";

        if (error.code === "file-too-large") {
          message = "File is too large. Maximum size is 50MB for Free plan.";
        } else if (error.code === "file-invalid-type") {
          message = "Only PDF files are allowed.";
        }

        toast({
          title: "Upload error",
          description: message,
          variant: "destructive",
        });
        return;
      }

      // Check batch limit
      const currentUploads = getAllUploads().filter(
        (u) => u.status === "uploading" || u.status === "processing"
      );
      
      if (currentUploads.length + acceptedFiles.length > 10) {
        toast({
          title: "Batch limit exceeded",
          description: "You can upload up to 10 files at once.",
          variant: "destructive",
        });
        return;
      }

      // Add files to queue
      const uploadIds = acceptedFiles.map((file) => addUpload(file));
      
      // Process files with concurrency limit
      for (let i = 0; i < uploadIds.length; i++) {
        const uploadId = uploadIds[i];
        const file = acceptedFiles[i];
        
        // Wait if we're at concurrency limit
        while (activeUploads >= 3) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        
        processFile(uploadId, file);
      }
    },
    [addUpload, getAllUploads, activeUploads, processFile, toast]
  );

  // Get current uploads for display
  const currentUploads = getAllUploads();
  const hasUploads = currentUploads.length > 0;
  const hasActive = hasActiveUploads();

  return (
    <div className="w-full">
      <Dropzone
        multiple={true}
        accept={{
          "application/pdf": [".pdf"],
        }}
        maxSize={50 * 1024 * 1024} // 50MB for Free (will check Pro limit server-side)
        onDrop={handleDrop}
      >
        {({ getRootProps, getInputProps, acceptedFiles, isDragActive }) => (
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
              isDragActive
                ? "border-primary-400 bg-primary-50 dark:bg-primary-900/10"
                : hasUploads
                ? "border-primary-300 bg-slate-50 dark:bg-slate-900/10"
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-primary-500 dark:hover:bg-gray-800/50"
            }`}
          >
            <div className="p-8">
              {!hasUploads ? (
                // Empty state
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/20">
                    <Cloud className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {isDragActive
                        ? "Drop your PDFs here"
                        : "Upload PDF documents"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drag and drop up to 10 PDFs, or click to browse
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Free plan: 50MB per file • Pro plan: 200MB per file
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="text-xs">
                      <Files className="w-3 h-3 mr-1" />
                      Batch upload
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      PDF only
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Secure upload
                    </Badge>
                  </div>
                </div>
              ) : (
                // Upload list
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {hasActive ? "Uploading files..." : "Upload complete"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {isDragActive
                        ? "Drop more PDFs to add to queue"
                        : "Click or drag to upload more files"}
                    </p>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {currentUploads.map((upload) => (
                      <Card key={upload.id} className="relative">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                upload.status === "success"
                                  ? "bg-green-100 dark:bg-green-900/20"
                                  : upload.status === "error"
                                  ? "bg-red-100 dark:bg-red-900/20"
                                  : "bg-primary-100 dark:bg-primary-900/20"
                              }`}
                            >
                              {upload.status === "success" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : upload.status === "error" ? (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                              ) : upload.status === "uploading" ||
                                upload.status === "processing" ? (
                                <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
                              ) : (
                                <File className="h-5 w-5 text-primary-600" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {upload.file.name}
                              </p>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(upload.file.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                                {upload.status === "error" && (
                                  <div className="flex flex-col space-y-1">
                                    <p className="text-xs text-red-600 dark:text-red-400">
                                      {upload.error}
                                    </p>
                                    {upload.dbFileId && (
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-xs text-primary-600 dark:text-primary-400"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          updateUpload(upload.id, {
                                            status: "processing",
                                            progress: 0,
                                          });
                                          await fetch("/api/process-upload", {
                                            method: "POST",
                                            headers: {
                                              "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({
                                              fileId: upload.dbFileId,
                                            }),
                                          });
                                          listenForProcessing(
                                            upload.id,
                                            upload.dbFileId,
                                            upload.file.name
                                          );
                                        }}
                                      >
                                        Retry processing
                                      </Button>
                                    )}
                                  </div>
                                )}
                                {upload.status === "success" && upload.dbFileId && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/dashboard/${upload.dbFileId}`);
                                    }}
                                  >
                                    Open →
                                  </Button>
                                )}
                              </div>
                            </div>

                            {(upload.status === "success" ||
                              upload.status === "error") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeUpload(upload.id);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {(upload.status === "uploading" ||
                            upload.status === "processing") && (
                            <div className="mt-2">
                              <Progress value={upload.progress} className="h-1" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {currentUploads.length > 0 &&
                    currentUploads.some(
                      (u) => u.status === "success" || u.status === "error"
                    ) && (
                      <div className="flex justify-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearCompleted();
                          }}
                        >
                          Clear completed
                        </Button>
                      </div>
                    )}
                </div>
              )}
            </div>

            <input {...getInputProps()} type="file" multiple className="hidden" />
          </div>
        )}
      </Dropzone>
    </div>
  );
};

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { getAllUploads } = useUploadStatusStore();
  const activeCount = getAllUploads().filter(
    (u) => u.status === "uploading" || u.status === "processing"
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative">
          <Upload className="h-4 w-4 mr-2" />
          Upload PDFs
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 bg-white/20 text-white border-0"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Upload Documents
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Upload up to 10 PDF documents at once. Each file will be processed with AI-powered analysis.
          </DialogDescription>
        </DialogHeader>
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
