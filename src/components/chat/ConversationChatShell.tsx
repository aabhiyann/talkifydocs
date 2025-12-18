"use client";

import { useState } from "react";
import PdfRenderer from "@/components/PdfRenderer";
import ChatWrapper from "@/components/chat/ChatWrapper";
import { FileManagementDropdown } from "./FileManagementDropdown";
import { ChatExportMenu } from "./ChatExportMenu";
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
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.fileId ?? "");
  const [currentPage, setCurrentPage] = useState<number | undefined>(1);
  const [currentFiles, setCurrentFiles] = useState<ConversationFile[]>(files);

  const activeFile =
    currentFiles.find((cf) => cf.fileId === activeFileId)?.file ?? currentFiles[0]?.file;

  if (!activeFile) {
    return (
      <div className="flex h-full items-center justify-center">
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
    <div className="flex h-full flex-col bg-background lg:flex-row">
      {/* Left: PDF viewer with file tabs */}
      <div className="flex w-full flex-col border-b border-border lg:w-1/2 lg:border-b-0 lg:border-r">
        {/* File selector */}
        <div className="flex gap-2 overflow-x-auto border-b border-border px-3 py-2">
          {currentFiles.map((cf) => (
            <button
              key={cf.fileId}
              type="button"
              onClick={() => setActiveFileId(cf.fileId)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1 text-sm transition-colors",
                activeFileId === cf.fileId
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-secondary-foreground hover:bg-secondary",
              )}
            >
              {cf.file.name}
            </button>
          ))}
        </div>

        {/* PDF viewer */}
        <div className="flex-1 p-4">
          <PdfRenderer
            url={activeFile.url}
            page={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Right: Chat */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="border-b p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chat</h2>
            <div className="flex items-center gap-2">
              <ChatExportMenu conversationId={conversationId} />
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
          </div>

          {/* File badges */}
          {currentFiles.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-2">
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
