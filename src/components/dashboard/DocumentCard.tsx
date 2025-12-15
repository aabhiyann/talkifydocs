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

type FileSummary = {
  id: string;
  name: string;
  createdAt: string | Date;
  uploadStatus: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  thumbnailUrl?: string | null;
  _count?: {
    messages?: number;
  };
};

type Props = {
  file: FileSummary;
  viewMode: "grid" | "list";
  onDelete: (id: string) => void;
  onRetry?: (id: string) => void;
};

export const DocumentCard = ({ file, viewMode, onDelete, onRetry }: Props) => {
  const createdAt =
    file.createdAt instanceof Date ? file.createdAt : new Date(file.createdAt);

  return (
    <Card className="group hover-lift hover-glow animate-scale-in transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 overflow-hidden">
              {file.thumbnailUrl ? (
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-heading-sm card-title group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                {file.name}
              </CardTitle>
              <div className="flex items-center space-x-2 text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                <Calendar className="w-4 h-4" />
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
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${file.id}`} className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  <span>View &amp; Chat</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="w-4 h-4 mr-2" />
                <span>Add to Favorites</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(file.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="w-4 h-4 mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </div>
          </div>
        </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <ProcessingStatus dbStatus={file.uploadStatus} />
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
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

          <div className="flex items-center space-x-4 text-body-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <MessagesSquare className="w-4 h-4" />
              <span>
                {file.uploadStatus === "SUCCESS"
                  ? "Ready to ask questions"
                  : "We’re preparing your document"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2">
            {file.uploadStatus === "SUCCESS" ? (
              <Link href={`/dashboard/${file.id}`} className="flex-1">
                <Button className="w-full group-hover:bg-primary-600 transition-colors duration-200">
                  <MessagesSquare className="w-4 h-4 mr-2" />
                  Start Chatting
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


