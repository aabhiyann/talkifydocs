"use client";

import { trpc } from "@/app/_trpc/client";

interface DebugInfoProps {
  fileId: string;
}

export default function DebugInfo({ fileId }: DebugInfoProps) {
  const { data: fileStatus } = trpc.getFileUploadStatus.useQuery({ fileId });
  const { data: userFiles } = trpc.getUserFiles.useQuery();

  const currentFile = userFiles?.find(file => file.id === fileId);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div><strong>File ID:</strong> {fileId}</div>
        <div><strong>Status:</strong> {fileStatus?.status || 'Loading...'}</div>
        <div><strong>File Name:</strong> {currentFile?.name || 'Unknown'}</div>
        <div><strong>Upload Status:</strong> {currentFile?.uploadStatus || 'Unknown'}</div>
        <div><strong>Created:</strong> {currentFile?.createdAt ? new Date(currentFile.createdAt).toLocaleString() : 'Unknown'}</div>
        <div><strong>URL:</strong> {currentFile?.url ? 'Present' : 'Missing'}</div>
      </div>
    </div>
  );
}
