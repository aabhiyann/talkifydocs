"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, ExternalLink } from "lucide-react";
import { deleteHighlight } from "@/actions/highlights";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Highlight {
  id: string;
  question: string;
  answer: string;
  citations?: any;
  createdAt: Date | string;
  file: {
    id: string;
    name: string;
  };
}

interface HighlightCardProps {
  highlight: Highlight;
}

export function HighlightCard({ highlight }: HighlightCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm("Are you sure you want to delete this highlight? This action cannot be undone.")
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteHighlight(highlight.id);
      toast({
        title: "Highlight deleted",
        description: "The highlight has been removed",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error deleting highlight",
        description: error instanceof Error ? error.message : "Failed to delete highlight",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = async () => {
    const text = `Q: ${highlight.question}\n\nA: ${highlight.answer}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Highlight content has been copied",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleViewDocument = () => {
    router.push(`/dashboard/${highlight.file.id}`);
  };

  const citations = Array.isArray(highlight.citations)
    ? highlight.citations
    : highlight.citations
    ? [highlight.citations]
    : [];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {highlight.question}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="truncate max-w-[200px]" title={highlight.file.name}>
                {highlight.file.name}
              </span>
              <span>•</span>
              <span>
                {format(new Date(highlight.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none mb-4 flex-1">
          <ReactMarkdown className="text-foreground">
            {highlight.answer}
          </ReactMarkdown>
        </div>

        {citations.length > 0 && (
          <div className="text-xs text-muted-foreground mb-4 flex flex-wrap gap-1">
            <strong className="mr-1">Sources:</strong>
            {citations.map((c: any, idx: number) => {
              const page =
                c.pageNumber ?? c.page ?? (typeof c.pageIndex === "number" ? c.pageIndex + 1 : undefined);
              return (
                <Badge key={idx} variant="outline" className="text-xs">
                  {page ? `p.${page}` : `Source ${idx + 1}`}
                </Badge>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDocument}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Doc
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

