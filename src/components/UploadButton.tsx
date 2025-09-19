"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File, Loader2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

const UploadDropzone = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { toast } = useToast();

  const { startUpload } = useUploadThing("pdfUploader");

  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      setUploadStatus("success");
      setTimeout(() => {
        router.push(`/dashboard/${file.id}`);
      }, 1000);
    },
    onError: (error) => {
      setUploadStatus("error");
      setErrorMessage(error.message || "Failed to process file");
    },
    retry: true,
    retryDelay: 500,
  });

  const startSimulatedProgress = () => {
    setUploadProgress(0);
    setUploadStatus("uploading");

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 90) {
          clearInterval(interval);
          setUploadStatus("processing");
          return prevProgress;
        }
        return prevProgress + Math.random() * 10;
      });
    }, 200);

    return interval;
  };

  const resetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatus("idle");
    setErrorMessage("");
  };

  return (
    <div className="w-full">
      <Dropzone
        multiple={false}
        accept={{
          'application/pdf': ['.pdf']
        }}
        maxSize={4 * 1024 * 1024} // 4MB
        onDrop={async (acceptedFile, rejectedFiles) => {
          if (rejectedFiles.length > 0) {
            const error = rejectedFiles[0].errors[0];
            let message = "File rejected";
            
            if (error.code === "file-too-large") {
              message = "File is too large. Maximum size is 4MB.";
            } else if (error.code === "file-invalid-type") {
              message = "Only PDF files are allowed.";
            }
            
            setErrorMessage(message);
            setUploadStatus("error");
            return;
          }

          setIsUploading(true);
          setErrorMessage("");

          const progressInterval = startSimulatedProgress();

          try {
            // handle file uploading
            const res = await startUpload(acceptedFile);

            if (!res) {
              throw new Error("Upload failed");
            }

            const [fileResponse] = res;
            const key = fileResponse?.key;

            if (!key) {
              throw new Error("No file key returned");
            }

            clearInterval(progressInterval);
            setUploadProgress(100);

            startPolling({ key });
          } catch (error) {
            clearInterval(progressInterval);
            setUploadStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "Upload failed");
          }
        }}
      >
        {({ getRootProps, getInputProps, acceptedFiles, isDragActive }) => (
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
              isDragActive
                ? "border-primary-400 bg-primary-50 dark:bg-primary-900/10"
                : uploadStatus === "error"
                ? "border-red-300 bg-red-50 dark:bg-red-900/10"
                : uploadStatus === "success"
                ? "border-primary-300 bg-primary-50 dark:bg-primary-900/10"
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-primary-500 dark:hover:bg-gray-800/50"
            }`}
          >
            <div className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                {/* Upload Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  uploadStatus === "success"
                    ? "bg-green-100 dark:bg-green-900/20"
                    : uploadStatus === "error"
                    ? "bg-red-100 dark:bg-red-900/20"
                    : "bg-primary-100 dark:bg-primary-900/20"
                }`}>
                  {uploadStatus === "success" ? (
                    <CheckCircle2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  ) : uploadStatus === "error" ? (
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  ) : isUploading ? (
                    <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                  ) : (
                    <Cloud className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  )}
                </div>

                {/* Upload Text */}
                <div className="text-center space-y-2">
                  {uploadStatus === "success" ? (
                    <>
                      <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300">
                        Upload Successful!
                      </h3>
                      <p className="text-sm text-primary-600 dark:text-primary-400">
                        Redirecting to your document...
                      </p>
                    </>
                  ) : uploadStatus === "error" ? (
                    <>
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                        Upload Failed
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errorMessage}
                      </p>
                    </>
                  ) : isUploading ? (
                    <>
                      <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300">
                        {uploadStatus === "processing" ? "Processing..." : "Uploading..."}
                      </h3>
                      <p className="text-sm text-primary-600 dark:text-primary-400">
                        {uploadStatus === "processing" 
                          ? "AI is analyzing your document..." 
                          : "Please wait while we upload your file..."
                        }
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {isDragActive ? "Drop your PDF here" : "Upload a PDF document"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Drag and drop your PDF here, or click to browse
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Maximum file size: 4MB
                      </p>
                    </>
                  )}
                </div>

                {/* File Preview */}
                {acceptedFiles && acceptedFiles[0] && uploadStatus !== "success" && (
                  <Card className="w-full max-w-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                          <File className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {acceptedFiles[0].name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Progress Bar */}
                {isUploading && uploadStatus !== "error" && (
                  <div className="w-full max-w-sm space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {uploadStatus === "processing" ? "Processing" : "Uploading"}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                    <Progress 
                      value={uploadProgress} 
                      className="h-2"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {uploadStatus === "error" && (
                  <div className="flex space-x-2">
                    <Button onClick={resetUpload} variant="outline" size="sm">
                      Try Again
                    </Button>
                    <Button onClick={() => window.location.reload()} size="sm">
                      Refresh Page
                    </Button>
                  </div>
                )}

                {/* Upload Requirements */}
                {uploadStatus === "idle" && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="text-xs">
                      PDF only
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Max 4MB
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Secure upload
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <input
              {...getInputProps()}
              type="file"
              className="hidden"
            />
          </div>
        )}
      </Dropzone>
    </div>
  );
};

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Upload className="h-4 w-4 mr-2" />
          Upload PDF
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Upload Document
          </DialogTitle>
        </DialogHeader>
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;