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
import { Cloud, File, Files, Loader2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "./ui/progress";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUploadStatusStore } from "@/hooks/useUploadStatus";
import { uploadPDF } from "@/actions";

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

  const listenForProcessing = useCallback(
    (uploadId: string, fileId: string, fileName: string) => {
      const eventSource = new EventSource(
        `/api/upload-status?fileId=${encodeURIComponent(fileId)}`,
      );

      eventSource.onmessage = (event) => {
        try {
          const file = JSON.parse(event.data) as {
            id: string;
            name: string;
            uploadStatus: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
            thumbnailUrl?: string | null;
            pageCount?: number | null;
            metadata?: Record<string, any> | null;
          } | null;

          if (!file) {
            updateUpload(uploadId, {
              status: "error",
              error: "File not found. Please try uploading again.",
            });
            eventSource.close();
            return;
          }

          const isSuccess = file.uploadStatus === "SUCCESS";
          const isFailed = file.uploadStatus === "FAILED";

          if (isSuccess) {
            updateUpload(uploadId, {
              status: "success",
              dbFileId: file.id,
            });

            const allUploads = getAllUploads();
            if (allUploads.length === 1) {
              setTimeout(() => {
                router.push(`/dashboard/${file.id}`);
              }, 1000);
            } else {
              toast({
                title: "Upload complete",
                description: `${file.name} has been processed successfully.`,
              });
            }

            eventSource.close();
            return;
          }

          if (isFailed) {
            updateUpload(uploadId, {
              status: "error",
              error: "We couldn't process this file. Please check the file and try again.",
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
    [getAllUploads, router, toast, updateUpload],
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

        // Build FormData for server action
        const formData = new FormData();
        formData.append("file", file);

        // Start actual upload via Server Action
        const result = await uploadPDF(formData);
        clearInterval(progressInterval);

        updateUpload(uploadId, {
          status: "processing",
          progress: 100,
        });

        // Start listening for processing status via SSE
        listenForProcessing(uploadId, result.fileId, file.name);
      } catch (error) {
        updateUpload(uploadId, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    },
    [updateUpload, listenForProcessing],
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
        (u) => u.status === "uploading" || u.status === "processing",
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
    [addUpload, getAllUploads, activeUploads, processFile, toast],
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
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 ${
              isDragActive
                ? "dark:bg-primary-900/10 border-primary-400 bg-primary-50"
                : hasUploads
                  ? "border-primary-300 bg-slate-50 dark:bg-slate-900/10"
                  : "dark:hover:bg-gray-800/50 border-gray-300 hover:border-primary-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-primary-500"
            }`}
          >
            <div className="p-8">
              {!hasUploads ? (
                // Empty state
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="dark:bg-primary-900/20 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                    <Cloud className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>

                  <div className="space-y-2 text-center">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {isDragActive ? "Drop your PDFs here" : "Upload PDF documents"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drag and drop up to 10 PDFs, or click to browse
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Free plan: 50MB per file • Pro plan: 200MB per file
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Files className="mr-1 h-3 w-3" />
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
                  <div className="mb-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {hasActive ? "Uploading files..." : "Upload complete"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {isDragActive
                        ? "Drop more PDFs to add to queue"
                        : "Click or drag to upload more files"}
                    </p>
                  </div>

                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {currentUploads.map((upload) => (
                      <Card key={upload.id} className="relative">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                upload.status === "success"
                                  ? "bg-green-100 dark:bg-green-900/20"
                                  : upload.status === "error"
                                    ? "bg-red-100 dark:bg-red-900/20"
                                    : "dark:bg-primary-900/20 bg-primary-100"
                              }`}
                            >
                              {upload.status === "success" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : upload.status === "error" ? (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                              ) : upload.status === "uploading" ||
                                upload.status === "processing" ? (
                                <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                              ) : (
                                <File className="h-5 w-5 text-primary-600" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
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
                                          if (upload.dbFileId) {
                                            listenForProcessing(
                                              upload.id,
                                              upload.dbFileId,
                                              upload.file.name,
                                            );
                                          }
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

                            {(upload.status === "success" || upload.status === "error") && (
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

                          {(upload.status === "uploading" || upload.status === "processing") && (
                            <div className="mt-2">
                              <Progress value={upload.progress} className="h-1" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {currentUploads.length > 0 &&
                    currentUploads.some((u) => u.status === "success" || u.status === "error") && (
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
    (u) => u.status === "uploading" || u.status === "processing",
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transition-all duration-200 hover:from-primary-700 hover:to-primary-800 hover:shadow-xl">
          <Upload className="mr-2 h-4 w-4" />
          Upload PDFs
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-2 border-0 bg-white/20 text-white">
              {activeCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">Upload Documents</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Upload up to 10 PDF documents at once. Each file will be processed with AI-powered
            analysis.
          </DialogDescription>
        </DialogHeader>
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
