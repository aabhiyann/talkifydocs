"use client";

import { useState } from "react";
import PdfRenderer from "@/components/PdfRenderer";
import ChatWrapper from "@/components/chat/ChatWrapper";
import { FileManagementDropdown } from "./FileManagementDropdown";
import { cn } from "@/lib/utils";
import type { File } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface ConversationFile {
  file: File;
  fileId: string;
}

interface ConversationChatShellProps {
  conversationId: string;
  files: ConversationFile[];
  availableFiles?: File[];
}

const ConversationChatShell = ({
  conversationId,
  files,
  availableFiles = [],
}: ConversationChatShellProps) => {
  const [activeFileId, setActiveFileId] = useState<string>(
    files[0]?.fileId ?? ""
  );
  const [currentPage, setCurrentPage] = useState<number | undefined>(1);
  const [currentFiles, setCurrentFiles] = useState<ConversationFile[]>(files);

  const activeFile = currentFiles.find((cf) => cf.fileId === activeFileId)?.file ?? currentFiles[0]?.file;

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No files in conversation</p>
      </div>
    );
  }

  const handleFileAdded = (file: File) => {
    setCurrentFiles([...currentFiles, { file, fileId: file.id }]);
    // Switch to newly added file
    setActiveFileId(file.id);
  };

  const handleFileRemoved = (fileId: string) => {
    const updated = currentFiles.filter((cf) => cf.fileId !== fileId);
    setCurrentFiles(updated);
    // If removed file was active, switch to first remaining file
    if (activeFileId === fileId && updated.length > 0) {
      setActiveFileId(updated[0].fileId);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-background">
      {/* Left: PDF viewer with file tabs */}
      <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border flex flex-col">
        {/* File selector */}
        <div className="border-b border-border px-3 py-2 flex gap-2 overflow-x-auto bg-muted/40">
          {currentFiles.map((cf) => (
            <button
              key={cf.fileId}
              type="button"
              onClick={() => setActiveFileId(cf.fileId)}
              className={cn(
                "px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors",
                activeFileId === cf.fileId
                  ? "bg-primary-600 text-white"
                  : "bg-background text-foreground hover:bg-muted"
              )}
            >
              {cf.file.name}
            </button>
          ))}
        </div>

        {/* PDF viewer */}
        <div className="flex-1 px-4 py-4 lg:px-6 lg:py-6">
          <PdfRenderer
            url={activeFile.url}
            page={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Right: Chat */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="border-b p-4 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">Chat</h2>
            {availableFiles.length > 0 && (
              <FileManagementDropdown
                conversationId={conversationId}
                currentFiles={currentFiles}
                availableFiles={availableFiles}
                onFileAdded={handleFileAdded}
                onFileRemoved={handleFileRemoved}
              />
            )}
          </div>

          {/* File badges */}
          {currentFiles.length > 1 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {currentFiles.map((cf) => (
                <Badge
                  key={cf.fileId}
                  variant={cf.fileId === activeFileId ? "default" : "secondary"}
                  className="text-xs"
                >
                  {cf.file.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatWrapper
            fileId={activeFile.id}
            onCitationClick={({ fileId, page }) => {
              if (fileId && fileId !== activeFileId) {
                const targetFile = currentFiles.find((cf) => cf.fileId === fileId);
                if (targetFile) {
                  setActiveFileId(fileId);
                }
              }
              if (typeof page === "number" && page > 0) {
                setCurrentPage(page);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ConversationChatShell;


