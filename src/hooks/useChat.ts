import { create } from "zustand";

type MessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
};

type ChatState = {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  addMessage: (message: ChatMessage) => void;
  setStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  error: null,
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      messages: [],
      isStreaming: false,
      error: null,
    }),
}));
