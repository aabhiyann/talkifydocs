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


