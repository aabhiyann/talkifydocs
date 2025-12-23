"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, Upload } from "lucide-react";
import { Badge } from "./ui/badge";
import { useUploadStatusStore } from "@/hooks/useUploadStatus";
import dynamic from "next/dynamic";

const UploadDropzone = dynamic(() => import("./UploadDropzone"), {
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Loading uploader...</p>
      </div>
    </div>
  ),
});

const UploadButton = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { getAllUploads } = useUploadStatusStore();
    const activeCount = getAllUploads().filter(
        (u) => u.status === "uploading" || u.status === "processing",
    ).length;

    if (!mounted) {
        return (
            <Button className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
                <Upload className="mr-2 h-4 w-4" />
                Upload PDFs
            </Button>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transition-all duration-200 hover:from-primary-700 hover:to-primary-800 hover:shadow-xl">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload PDFs
                    {activeCount > 0 && (
                        <Badge variant="secondary" className="ml-2 border-0 bg-white/20 text-white">
                            {activeCount}
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-semibold">Upload Documents</DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        Upload up to 10 PDF documents at once. Each file will be processed with AI-powered analysis.
                    </DialogDescription>
                </DialogHeader>
                <UploadDropzone />
            </DialogContent>
        </Dialog>
    );
};

export default UploadButton;