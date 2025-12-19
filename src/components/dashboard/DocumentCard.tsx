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
  Clock,
  MessagesSquare,
  Trash,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { ProcessingStatus } from "./ProcessingStatus";

import type { FileSummary } from "@/types";

interface DocumentCardProps {
  file: FileSummary;
  viewMode: "grid" | "list";
  onDelete: (id: string) => void;
  onRetry?: (id: string) => void;
  isDemo?: boolean;
}

export const DocumentCard = ({
  file,
  viewMode,
  onDelete,
  onRetry,
  isDemo = false,
}: DocumentCardProps) => {
  const createdAt = file.createdAt instanceof Date ? file.createdAt : new Date(file.createdAt);

  const summary =
    file.summary && file.summary.length > 220
      ? `${file.summary.slice(0, 200).trim()}…`
      : file.summary || null;

  const keyTerms: string[] = file.entities?.keyTerms || [];
  const topKeyTerms = keyTerms.slice(0, 3);

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl dark:hover:border-primary-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 transition-transform duration-200 group-hover:scale-110">
              {file.thumbnailUrl ? (
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FileText className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-heading-sm card-title line-clamp-2 font-serif transition-colors duration-200 group-hover:text-primary-600">
                {file.name}
              </CardTitle>
              <div className="text-body-sm mt-1 flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{format(createdAt, "MMM dd, yyyy")}</span>
                {typeof file._count?.messages === "number" && (
                  <>
                    <span>•</span>
                    <span>{file._count.messages} messages</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={isDemo ? `/demo/chat/${file.id}` : `/dashboard/${file.id}`}
                  className="flex items-center"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View &amp; Chat</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" />
                <span>Add to Favorites</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isDemo && (
                <DropdownMenuItem
                  onClick={() => onDelete(file.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <ProcessingStatus dbStatus={file.uploadStatus} />
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="mr-1 h-3 w-3" />
              <span>
                {file.uploadStatus === "SUCCESS"
                  ? "Processed"
                  : file.uploadStatus === "PROCESSING"
                    ? "Processing…"
                    : file.uploadStatus === "FAILED"
                      ? "Failed"
                      : "Queued"}
              </span>
            </div>
          </div>

          <div className="text-body-sm flex items-center space-x-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <MessagesSquare className="h-4 w-4" />
              <span>
                {file.uploadStatus === "SUCCESS"
                  ? "Ready to ask questions"
                  : "We’re preparing your document"}
              </span>
            </div>

            {typeof file.pageCount === "number" && file.pageCount > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{file.pageCount}</span>
                <span>pages</span>
              </div>
            )}
          </div>

          {summary && (
            <p className="line-clamp-3 text-xs text-gray-600 dark:text-gray-400">{summary}</p>
          )}

          {topKeyTerms.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {topKeyTerms.map((term) => (
                <span
                  key={term}
                  className="dark:bg-primary-900/30 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700 dark:text-primary-300"
                >
                  {term}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            {file.uploadStatus === "SUCCESS" ? (
              <Link
                href={isDemo ? `/demo/chat/${file.id}` : `/dashboard/${file.id}`}
                className="flex-1"
              >
                <Button className="w-full transition-colors duration-200 group-hover:bg-primary-600">
                  <MessagesSquare className="mr-2 h-4 w-4" />
                  {isDemo ? "Try Demo" : "Start Chatting"}
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={file.uploadStatus === "PROCESSING"}
                  onClick={() => {
                    if (file.uploadStatus === "FAILED" && onRetry) {
                      onRetry(file.id);
                    }
                  }}
                >
                  {file.uploadStatus === "PROCESSING"
                    ? "Processing…"
                    : file.uploadStatus === "FAILED"
                      ? "Retry processing"
                      : "Queued for processing"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
