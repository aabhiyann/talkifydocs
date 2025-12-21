"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  FileText,
  Calendar,
  MoreVertical,
  Eye,
  Download,
  Share2,
  Star,
  Trash,
  MessagesSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { componentStyles } from "@/styles/design-system.config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { FileSummary } from "@/types";

interface DocumentCardProps {
  file: FileSummary;
  viewMode?: "grid" | "list";
  onDelete: (id: string) => void;
  onRetry?: (id: string) => void;
  isDemo?: boolean;
}

const formatFileSize = (bytes: string | number | bigint) => {
  const b = typeof bytes === "string" ? parseInt(bytes, 10) : Number(bytes);
  if (b === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM dd, yyyy");
};

export const DocumentCard = ({
  file,
  viewMode = "grid",
  onDelete,
  onRetry,
  isDemo = false,
}: DocumentCardProps) => {
  const handleClick = () => {
    // If we want to handle programmatic navigation
    if (typeof window !== "undefined") {
      window.location.href = isDemo ? `/demo/chat/${file.id}` : `/dashboard/${file.id}`;
    }
  };

  return (
    <div className={componentStyles.documentCard.container} onClick={handleClick}>
      {/* Thumbnail */}
      <div className={componentStyles.documentCard.thumbnail}>
        {file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            className={componentStyles.documentCard.thumbnailImage}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute right-3 top-3">
          <Badge
            variant={
              file.uploadStatus === "SUCCESS"
                ? "success"
                : file.uploadStatus === "FAILED"
                  ? "error"
                  : file.uploadStatus === "PROCESSING"
                    ? "warning"
                    : "neutral"
            }
          >
            {file.uploadStatus}
          </Badge>
        </div>

        {/* Actions Dropdown - Overlay to prevent triggering card click */}
        <div className="absolute left-3 top-3" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full bg-white/80 p-0 text-gray-700 backdrop-blur-sm hover:bg-white dark:bg-black/50 dark:text-gray-300 dark:hover:bg-black"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href={isDemo ? `/demo/chat/${file.id}` : `/dashboard/${file.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(file.id)} className="text-error-600 focus:text-error-600">
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className={componentStyles.documentCard.content}>
        <h3 className={componentStyles.documentCard.title}>{file.name}</h3>
        <div className={componentStyles.documentCard.meta}>
          <span>{file.pageCount || 0} pages</span>
          <span>•</span>
          <span>{formatFileSize(file.size)}</span>
          <span>•</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>

        {/* Action Button - Overlay to prevent card click */}
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <Link href={isDemo ? `/demo/chat/${file.id}` : `/dashboard/${file.id}`}>
            <Button
              className="w-full transition-colors duration-200 group-hover:bg-primary-600"
              disabled={file.uploadStatus !== "SUCCESS"}
            >
              <MessagesSquare className="mr-2 h-4 w-4" />
              {file.uploadStatus === "SUCCESS" ? "Start Chatting" : "Processing..."}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};