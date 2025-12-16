export type IncomingChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export type DocumentMetadata = {
  fileId: string;
  page?: number;
  pageIndex?: number;
  title?: string;
  fileName?: string;
};
