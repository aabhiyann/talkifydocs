"use client";

import { useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload } from "lucide-react";
import { upload } from "@vercel/blob/client";

import { cn } from "@/lib/utils";
import { useUploadStatusStore } from "@/hooks/useUploadStatus";
import { useToast } from "@/components/ui/use-toast";

interface UploadZoneProps {
  onUpload?: (files: File[]) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const { toast } = useToast();
  const {
    addUpload,
    updateUpload,
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

      if (onUpload) {
        onUpload(acceptedFiles);
      }

      for (const file of acceptedFiles) {
        const uploadId = addUpload(file);
        
        try {
          updateUpload(uploadId, { status: "uploading" });
          
          await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload/blob",
            clientPayload: JSON.stringify({ size: file.size }),
            onUploadProgress: (progressEvent) => {
              updateUpload(uploadId, { progress: progressEvent.percentage });
            },
          });

          updateUpload(uploadId, { status: "processing", progress: 100 });
          
          // Mark success after delay
          setTimeout(() => {
            updateUpload(uploadId, { status: "success" });
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
    },
    [addUpload, updateUpload, getAllUploads, toast, onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300',
        isDragActive 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
          : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-900'
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary-600" />
        </div>
        
        <div>
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDFs'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            or <span className="text-primary-600 font-medium">browse files</span>
          </p>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-500">
          PDF files up to 50MB
        </p>
      </div>
    </div>
  );
}