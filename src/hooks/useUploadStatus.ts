import { create } from "zustand";

export type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

export type FileUpload = {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  dbFileId?: string;
};

type BatchUploadState = {
  uploads: Map<string, FileUpload>;
  activeUploads: number;
  maxConcurrent: number;

  // Actions
  addUpload: (file: File) => string;
  updateUpload: (id: string, update: Partial<FileUpload>) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
  reset: () => void;

  // Getters
  getUpload: (id: string) => FileUpload | undefined;
  getAllUploads: () => FileUpload[];
  hasActiveUploads: () => boolean;
};

export const useUploadStatusStore = create<BatchUploadState>((set, get) => ({
  uploads: new Map(),
  activeUploads: 0,
  maxConcurrent: 3,

  addUpload: (file) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const upload: FileUpload = {
      id,
      file,
      progress: 0,
      status: "idle",
    };

    set((state) => {
      const newUploads = new Map(state.uploads);
      newUploads.set(id, upload);
      return { uploads: newUploads };
    });

    return id;
  },

  updateUpload: (id, update) => {
    set((state) => {
      const upload = state.uploads.get(id);
      if (!upload) return state;

      const newUpload = { ...upload, ...update };
      const newUploads = new Map(state.uploads);
      newUploads.set(id, newUpload);

      // Update active uploads count
      let activeCount = 0;
      newUploads.forEach((u) => {
        if (u.status === "uploading" || u.status === "processing") {
          activeCount++;
        }
      });

      return { uploads: newUploads, activeUploads: activeCount };
    });
  },

  removeUpload: (id) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      newUploads.delete(id);

      // Update active count
      let activeCount = 0;
      newUploads.forEach((u) => {
        if (u.status === "uploading" || u.status === "processing") {
          activeCount++;
        }
      });

      return { uploads: newUploads, activeUploads: activeCount };
    });
  },

  clearCompleted: () => {
    set((state) => {
      const newUploads = new Map();
      state.uploads.forEach((upload, id) => {
        if (upload.status !== "success" && upload.status !== "error") {
          newUploads.set(id, upload);
        }
      });
      return { uploads: newUploads };
    });
  },

  reset: () => {
    set({ uploads: new Map(), activeUploads: 0 });
  },

  getUpload: (id) => {
    return get().uploads.get(id);
  },

  getAllUploads: () => {
    return Array.from(get().uploads.values());
  },

  hasActiveUploads: () => {
    return get().activeUploads > 0;
  },
}));
