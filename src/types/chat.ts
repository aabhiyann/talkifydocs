export type IncomingChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export interface Citation {
  fileId: string;
  fileName: string;
  pageNumber: number;
  snippet?: string;
  source?: number;
}

export interface DocumentEntities {
  keyTerms?: string[];
}

export type DocumentMetadata = {
  fileId: string;
  fileName: string;
  pageNumber?: number;
  title?: string;
};
