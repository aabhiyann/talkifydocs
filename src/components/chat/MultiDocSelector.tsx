"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_trpc/client";
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
  const router = useRouter();
  const { toast } = useToast();

  const { mutate: createConversation, isLoading: isCreating } =
    trpc.createConversation.useMutation({
      onSuccess: (conversation) => {
        router.push(`/chat/${conversation.id}`);
        setOpen(false);
        setSelected([]);
      },
      onError: (error) => {
        toast({
          title: "Error creating conversation",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const handleCreate = () => {
    if (selected.length < 2 || selected.length > 5) {
      toast({
        title: "Invalid selection",
        description: "Please select between 2 and 5 documents",
        variant: "destructive",
      });
      return;
    }

    createConversation({ fileIds: selected });
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
        <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col">
          <DialogHeader>
            <DialogTitle>Select Documents to Compare</DialogTitle>
            <DialogDescription>
              Choose 2-5 documents to compare and chat with together
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            {files.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No documents available</div>
            ) : (
              files.map((file) => (
                <label
                  key={file.id}
                  className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <Checkbox
                    checked={selected.includes(file.id)}
                    onCheckedChange={(checked) => handleToggle(file.id, checked === true)}
                    disabled={selected.length >= 5 && !selected.includes(file.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{file.name}</p>
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

          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {selected.length} document{selected.length !== 1 ? "s" : ""} selected
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
                disabled={selected.length < 2 || selected.length > 5 || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
