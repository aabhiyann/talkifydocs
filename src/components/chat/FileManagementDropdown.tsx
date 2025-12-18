"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, X, MoreVertical, Loader2 } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import type { File } from "@prisma/client";

interface ConversationFile {
  file: File;
  fileId: string;
}

interface FileManagementDropdownProps {
  conversationId: string;
  currentFiles: ConversationFile[];
  availableFiles: File[];
  onFileAdded: (file: File) => void;
  onFileRemoved: (fileId: string) => void;
}

export function FileManagementDropdown({
  conversationId,
  currentFiles,
  availableFiles,
  onFileAdded,
  onFileRemoved,
}: FileManagementDropdownProps) {
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const utils = trpc.useContext();

  const { mutate: addFile, isLoading: isAdding } = trpc.addFileToConversation.useMutation({
    onSuccess: (_, { fileId }) => {
      const file = availableFiles.find((f) => f.id === fileId);
      if (file) {
        onFileAdded(file);
      }
      utils.getConversationMessages.invalidate({ conversationId });
      router.refresh();
      toast({
        title: "File added",
        description: "The file has been added to the conversation",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding file",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setLoadingFile(null);
    },
  });

  const { mutate: removeFile, isLoading: isRemoving } = trpc.removeFileFromConversation.useMutation({
    onSuccess: (_, { fileId }) => {
      onFileRemoved(fileId);
      utils.getConversationMessages.invalidate({ conversationId });
      router.refresh();
      toast({
        title: "File removed",
        description: "The file has been removed from the conversation",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing file",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setLoadingFile(null);
    },
  });


  const currentFileIds = new Set(currentFiles.map((cf) => cf.fileId));
  const canAddFiles = availableFiles.filter(
    (f) => !currentFileIds.has(f.id) && currentFiles.length < 5,
  );

  const handleAddFile = (fileId: string) => {
    setLoadingFile(fileId);
    addFile({ conversationId, fileId });
  };

  const handleRemoveFile = (fileId: string) => {
    if (currentFiles.length <= 1) {
      toast({
        title: "Cannot remove file",
        description: "A conversation must have at least one file",
        variant: "destructive",
      });
      return;
    }
    setLoadingFile(fileId);
    removeFile({ conversationId, fileId });
  };

  const isLoading = isAdding || isRemoving;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {canAddFiles.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-sm font-semibold">Add File</div>
            {canAddFiles.map((file) => (
              <DropdownMenuItem
                key={file.id}
                onClick={() => handleAddFile(file.id)}
                disabled={isLoading && loadingFile === file.id}
              >
                {isLoading && loadingFile === file.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                <span className="truncate">{file.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        {currentFiles.length > 1 && (
          <>
            <div className="px-2 py-1.5 text-sm font-semibold">Remove File</div>
            {currentFiles.map((cf) => (
              <DropdownMenuItem
                key={cf.fileId}
                onClick={() => handleRemoveFile(cf.fileId)}
                disabled={isLoading && loadingFile === cf.fileId}
                className="text-destructive focus:text-destructive"
              >
                {isLoading && loadingFile === cf.fileId ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                <span className="truncate">{cf.file.name}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
        {canAddFiles.length === 0 && currentFiles.length <= 1 && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No actions available</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
