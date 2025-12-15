"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, Share2, FileText, Link2, X } from "lucide-react";
import {
  exportChatAsMarkdown,
  createShareableLink,
  revokeShareableLink,
  getShareableLink,
} from "@/actions/export";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

interface ChatExportMenuProps {
  conversationId: string;
}

export function ChatExportMenu({ conversationId }: ChatExportMenuProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isLoadingShare, setIsLoadingShare] = useState(true);

  useEffect(() => {
    // Check if share link already exists
    getShareableLink(conversationId)
      .then((url) => {
        setShareUrl(url);
      })
      .catch(() => {
        setShareUrl(null);
      })
      .finally(() => {
        setIsLoadingShare(false);
      });
  }, [conversationId]);

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      const markdown = await exportChatAsMarkdown(conversationId);

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
    } catch (error) {
      toast({
        title: "Export failed",
        description:
          error instanceof Error ? error.message : "Failed to export chat",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateShare = async () => {
    setIsSharing(true);
    try {
      const url = await createShareableLink(conversationId);
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      toast({
        title: "Share link created",
        description: "Share link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to create share link",
        description:
          error instanceof Error ? error.message : "Failed to create share link",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

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

  const handleRevokeShare = async () => {
    try {
      await revokeShareableLink(conversationId);
      setShareUrl(null);
      toast({
        title: "Share link revoked",
        description: "The share link has been disabled",
      });
    } catch (error) {
      toast({
        title: "Failed to revoke link",
        description:
          error instanceof Error ? error.message : "Failed to revoke share link",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoadingShare}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={handleExportMarkdown}
          disabled={isExporting}
        >
          <FileText className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export as Markdown"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {shareUrl ? (
          <>
            <DropdownMenuItem onClick={handleCopyShareLink}>
              <Link2 className="w-4 h-4 mr-2" />
              Copy Share Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRevokeShare}>
              <X className="w-4 h-4 mr-2" />
              Revoke Share Link
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={handleCreateShare} disabled={isSharing}>
            <Share2 className="w-4 h-4 mr-2" />
            {isSharing ? "Creating..." : "Create Share Link"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

