import { DocumentCard } from "./DocumentCard";

type FileSummary = {
  id: string;
  name: string;
  createdAt: string | Date;
  uploadStatus: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  thumbnailUrl?: string | null;
  _count?: {
    messages?: number;
  };
};

type Props = {
  files: FileSummary[];
  viewMode: "grid" | "list";
  onDelete: (id: string) => void;
  onRetry?: (id: string) => void;
};

export const DocumentGrid = ({ files, viewMode, onDelete, onRetry }: Props) => {
  if (!files.length) {
    return null;
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 gap-6 md:grid-cols=2 lg:grid-cols-3"
          : "space-y-4"
      }
    >
      {files.map((file, index) => (
        <div
          key={file.id}
          className="animate-scale-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <DocumentCard
            file={file}
            viewMode={viewMode}
            onDelete={onDelete}
            onRetry={onRetry}
          />
        </div>
      ))}
    </div>
  );
};


