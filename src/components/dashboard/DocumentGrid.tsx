import { DocumentCard } from "./DocumentCard";
import { memo } from "react";
import { FileSummary } from "@/types";

type Props = {
  files: FileSummary[];
  viewMode: "grid" | "list";
  onDelete: (id: string) => void;
  onRetry?: (id: string) => void;
  isDemo?: boolean;
};

export const DocumentGrid = ({ files, viewMode, onDelete, onRetry, isDemo = false }: Props) => {
  if (!files.length) {
    return null;
  }

  const MemoizedDocumentCard = memo(DocumentCard);

  return (
    <div
      className={
        viewMode === "grid" ? "md:grid-cols=2 grid grid-cols-1 gap-6 lg:grid-cols-3" : "space-y-4"
      }
    >
      {files.map((file, index) => (
        <div
          key={file.id}
          className="animate-scale-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <MemoizedDocumentCard
            file={file}
            viewMode={viewMode}
            onDelete={onDelete}
            onRetry={onRetry}
            isDemo={isDemo}
          />
        </div>
      ))}
    </div>
  );
};
