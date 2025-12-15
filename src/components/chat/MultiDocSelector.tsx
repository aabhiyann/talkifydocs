"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { createConversation } from "@/actions/conversations";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import type { File } from "@prisma/client";

interface MultiDocSelectorProps {
  files: File[];
}

export function MultiDocSelector({ files }: MultiDocSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (selected.length < 2 || selected.length > 5) {
      toast({
        title: "Invalid selection",
        description: "Please select between 2 and 5 documents",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const conversation = await createConversation(selected);
      router.push(`/chat/${conversation.id}`);
      setOpen(false);
      setSelected([]);
    } catch (error) {
      toast({
        title: "Error creating conversation",
        description: error instanceof Error ? error.message : "Failed to create conversation",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = (fileId: string, checked: boolean) => {
    if (checked) {
      if (selected.length >= 5) {
        toast({
          title: "Maximum files reached",
          description: "You can select up to 5 documents",
          variant: "destructive",
        });
        return;
      }
      setSelected([...selected, fileId]);
    } else {
      setSelected(selected.filter((id) => id !== fileId));
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Compare Documents
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Documents to Compare</DialogTitle>
            <DialogDescription>
              Choose 2-5 documents to compare and chat with together
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
            {files.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No documents available
              </div>
            ) : (
              files.map((file) => (
                <label
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selected.includes(file.id)}
                    onCheckedChange={(checked) =>
                      handleToggle(file.id, checked === true)
                    }
                    disabled={
                      selected.length >= 5 && !selected.includes(file.id)
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.pageCount ?? 0} pages •{" "}
                      {file.size
                        ? `${(Number(file.size) / 1024 / 1024).toFixed(2)} MB`
                        : "Unknown size"}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selected.length} document{selected.length !== 1 ? "s" : ""}{" "}
              selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setSelected([]);
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  selected.length < 2 || selected.length > 5 || isCreating
                }
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Start Conversation"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

