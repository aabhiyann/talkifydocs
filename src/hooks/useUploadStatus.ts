import { create } from "zustand";

export type UploadStatus = "PENDING" | "PROCESSING" | "FAILED" | "SUCCESS";

type FileUploadState = {
  fileId: string | null;
  status: UploadStatus | null;
  error: string | null;
  setFile: (fileId: string | null) => void;
  setStatus: (status: UploadStatus | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

export const useUploadStatusStore = create<FileUploadState>((set) => ({
  fileId: null,
  status: null,
  error: null,
  setFile: (fileId) => set({ fileId }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      fileId: null,
      status: null,
      error: null,
    }),
}));


