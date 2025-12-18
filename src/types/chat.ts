export type IncomingChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export interface Citation {
  source?: number;
  fileId?: string;
  page?: number;
  pageIndex?: number;
  snippet?: string;
  title?: string;
  filename?: string;
  fileName?: string;
}

export type DocumentMetadata = {
  fileId: string;
  page?: number;
  pageIndex?: number;
  title?: string;
  fileName?: string;
};
