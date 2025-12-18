"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, Share2, FileText, Link2, X, Loader2 } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "@/components/ui/use-toast";

interface ChatExportMenuProps {
  conversationId: string;
}

export function ChatExportMenu({ conversationId }: ChatExportMenuProps) {
  const { toast } = useToast();

  const { data: shareUrl, isLoading: isLoadingShare } = trpc.getShareableLink.useQuery(
    { conversationId },
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );

  const utils = trpc.useContext();

  const { mutate: exportMarkdown, isLoading: isExporting } = trpc.exportChatAsMarkdown.useMutation({
    onSuccess: (markdown) => {
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-export-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Chat exported",
        description: "Chat has been exported as Markdown",
      });
    },
    onError: (error) => {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate: createShareLink, isLoading: isCreatingShare } = trpc.createShareableLink.useMutation({
    onSuccess: (url) => {
      utils.getShareableLink.setData({ conversationId }, url);
      navigator.clipboard.writeText(url);
      toast({
        title: "Share link created",
        description: "Share link has been copied to clipboard",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create share link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate: revokeShareLink, isLoading: isRevokingShare } = trpc.revokeShareableLink.useMutation({
    onSuccess: () => {
      utils.getShareableLink.setData({ conversationId }, null);
      toast({
        title: "Share link revoked",
        description: "The share link has been disabled",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to revoke link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const isLoading = isExporting || isCreatingShare || isRevokingShare;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoadingShare || isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => exportMarkdown({ conversationId })} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {shareUrl ? (
          <>
            <DropdownMenuItem onClick={handleCopyShareLink}>
              <Link2 className="mr-2 h-4 w-4" />
              Copy Share Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => revokeShareLink({ conversationId })} disabled={isRevokingShare}>
              {isRevokingShare ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Revoke Share Link
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={() => createShareLink({ conversationId })} disabled={isCreatingShare}>
            {isCreatingShare ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            Create Share Link
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
