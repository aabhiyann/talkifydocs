"use client";

import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, ExternalLink } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface Highlight {
  id: string;
  question: string;
  answer: string;
  citations?: any;
  createdAt: Date | string;
  file: {
    id:string;
    name: string;
  };
}

interface HighlightCardProps {
  highlight: Highlight;
}

export function HighlightCard({ highlight }: HighlightCardProps) {
  const router = useRouter();
  const { toast } = useToast();

  const { mutate: deleteHighlight, isLoading: isDeleting } =
    trpc.deleteHighlight.useMutation({
      onSuccess: () => {
        toast({
          title: "Highlight deleted",
          description: "The highlight has been removed",
        });
        router.refresh();
      },
      onError: (error) => {
        toast({
          title: "Error deleting highlight",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this highlight? This action cannot be undone.")) {
      return;
    }
    deleteHighlight({ id: highlight.id });
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
    <ModernCard variant="elevated" className="flex h-full flex-col">
      <ModernCardContent className="flex flex-1 flex-col">
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{highlight.question}</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="max-w-[200px] truncate" title={highlight.file.name}>
                {highlight.file.name}
              </span>
              <span>•</span>
              <span>{format(new Date(highlight.createdAt), "MMM d, yyyy")}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="hover:bg-destructive/10 flex-shrink-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="prose prose-sm dark:prose-invert mb-4 max-w-none flex-1">
          <ReactMarkdown className="text-foreground">{highlight.answer}</ReactMarkdown>
        </div>

        {citations.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1 text-xs text-muted-foreground">
            <strong className="mr-1">Sources:</strong>
            {citations.map((c: any, idx: number) => {
              const page =
                c.pageNumber ??
                c.page ??
                (typeof c.pageIndex === "number" ? c.pageIndex + 1 : undefined);
              return (
                <Badge key={idx} variant="outline" className="text-xs">
                  {page ? `p.${page}` : `Source ${idx + 1}`}
                </Badge>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 border-t pt-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewDocument} className="flex-1">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Doc
          </Button>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
}
