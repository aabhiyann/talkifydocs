import type {
  User,
  File,
  Conversation,
  ConversationFile,
  Message,
  Highlight,
  RateLimit,
} from "@prisma/client";

export type DbUser = User;
export type DbFile = File;
export type DbConversation = Conversation;
export type DbConversationFile = ConversationFile;
export type DbMessage = Message;
export type DbHighlight = Highlight;
export type DbRateLimit = RateLimit;

// Common composite types for richer queries
export type FileWithUser = File & { user: User };
export type MessageWithFile = Message & { file: File | null };
export type ConversationWithRelations = Conversation & {
  user: User;
  messages: Message[];
  conversationFiles: (ConversationFile & { file: File })[];
};

