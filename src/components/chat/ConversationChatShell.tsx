"use client";

import { useState } from "react";
import PdfRenderer from "@/components/PdfRenderer";
import ChatWrapper from "@/components/chat/ChatWrapper";
import { cn } from "@/lib/utils";
import type { File } from "@prisma/client";

interface ConversationChatShellProps {
  files: File[];
}

const ConversationChatShell = ({ files }: ConversationChatShellProps) => {
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id);
  const [currentPage, setCurrentPage] = useState<number | undefined>(1);

  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];

  return (
    <div className="flex flex-col lg:flex-row h-full bg-background">
      {/* Left: PDF viewer with file tabs */}
      <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border flex flex-col">
        {/* File selector */}
        <div className="border-b border-border px-3 py-2 flex gap-2 overflow-x-auto bg-muted/40">
          {files.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => setActiveFileId(file.id)}
              className={cn(
                "px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors",
                activeFile.id === file.id
                  ? "bg-primary-600 text-white"
                  : "bg-background text-foreground hover:bg-muted"
              )}
            >
              {file.name}
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
        <ChatWrapper
          fileId={activeFile.id}
          onCitationClick={({ fileId, page }) => {
            if (fileId && fileId !== activeFileId) {
              setActiveFileId(fileId);
            }
            if (typeof page === "number" && page > 0) {
              setCurrentPage(page);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ConversationChatShell;


