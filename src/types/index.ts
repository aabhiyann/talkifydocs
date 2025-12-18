import { DocumentEntities } from "./chat";

export type PdfFile = {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
};

export type UserRole = "FREE" | "PRO" | "ADMIN";

export type FileSummary = {
  id: string;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  uploadStatus: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  size: bigint | number | string;
  key: string;
  url: string;
  userId: string;
  thumbnailUrl?: string | null;
  pageCount?: number | null;
  summary?: string | null;
  entities?: DocumentEntities | null;
  _count?: {
    messages?: number;
  };
};
