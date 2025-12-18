"use client";

import { useState, useCallback } from "react";
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
import { upload } from "@vercel/blob/client";

interface DropFileError {
  code: string;
  message: string;
}

interface FileRejection {
  file: File;
  errors: DropFileError[];
}

const UploadDropzone = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const {
    addUpload,
    updateUpload,
    removeUpload,
    clearCompleted,
    getAllUploads,
  } = useUploadStatusStore();

  const handleDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles.length === 0) return;

      const currentActiveUploads = getAllUploads().filter(
        (u) => u.status === "uploading" || u.status === "processing",
      );

      if (currentActiveUploads.length + acceptedFiles.length > 10) {
        toast({
          title: "Batch limit exceeded",
          description: "You can upload up to 10 files at once.",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);

      for (const file of acceptedFiles) {
        const uploadId = addUpload(file);
        
        try {
          updateUpload(uploadId, { status: "uploading" });
          
          const newBlob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload/blob",
            onUploadProgress: (progressEvent) => {
              updateUpload(uploadId, { progress: progressEvent.percentage });
            },
          });

          updateUpload(uploadId, { status: "processing", progress: 100 });
          
          // Since we can't easily get the DB ID back from Vercel Blob's client upload 
          // (it's created in a background webhook), we'll just mark it as success 
          // after a short delay or let the user see it in the dashboard.
          // For single file uploads, we might want to redirect eventually.
          
          setTimeout(() => {
            updateUpload(uploadId, { status: "success" });
            if (acceptedFiles.length === 1) {
              // Optionally redirect to dashboard if it was just one file
              // router.push('/dashboard');
            }
          }, 2000);

        } catch (error) {
          updateUpload(uploadId, { status: "error", error: (error as Error).message });
          toast({
            title: "Upload failed",
            description: (error as Error).message,
            variant: "destructive",
          });
        }
      }
      
      setIsUploading(false);
    },
    [addUpload, updateUpload, getAllUploads, toast],
  );

  const currentUploads = getAllUploads();
  const hasUploads = currentUploads.length > 0;

  return (
    <div className="w-full">
      <Dropzone
        multiple={true}
        accept={{
          "application/pdf": [".pdf"],
        }}
        onDrop={handleDrop}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
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
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {isUploading ? "Uploading files..." : "Uploads"}
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
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {upload.error}
                                  </p>
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
                  {currentUploads.length > 0 && (
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
        <Dialog open={isOpen} onOpenChange={(v) => { if (!v) setIsOpen(v) }}>
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
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
                        Upload up to 10 PDF documents at once. Each file will be processed with AI-powered analysis.
                    </DialogDescription>
                </DialogHeader>
                <UploadDropzone />
            </DialogContent>
        </Dialog>
    );
};

export default UploadButton;
