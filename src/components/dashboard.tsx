"use client";

import React, { useState, memo, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Ghost,
  FileText,
  Search,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";

import { trpc } from "@/app/_trpc/client";
import { UploadZone } from "./dashboard/UploadZone";
import UploadButton from "./UploadButton";
import { DocumentGrid } from "./dashboard/DocumentGrid";
import { MultiDocSelector } from "./chat/MultiDocSelector";
import { DocumentCardSkeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { SearchBar, SearchFilters } from "./SearchBar";
import { EmptyState } from "./shared/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { useToastOptions } from "@/hooks/useToastMutation";

import type { FileSummary } from "@/types";

export const Dashboard = memo(() => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: "date",
    sortOrder: "desc",
  });

  const utils = trpc.useUtils();

  const { data: files, isLoading, error } = trpc.getUserFiles.useQuery();

  const deleteFileToastOptions = useToastOptions({
    successTitle: "File deleted",
    successDescription: "Your document has been removed",
    onSuccess: () => {
      utils.getUserFiles.invalidate();
    },
  });

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    ...deleteFileToastOptions,
    onMutate: ({ id }: { id: string }) => {
      setCurrentlyDeletingFile(id);
    },
    onSettled: () => {
      setCurrentlyDeletingFile(null);
    },
  });

  const { mutate: retryProcessing } = trpc.retryUploadProcessing.useMutation(
    useToastOptions({
      successTitle: "Processing retried",
      successDescription: "We're re-analyzing your document",
      onSuccess: () => {
        utils.getUserFiles.invalidate();
      }
    })
  );

  const handleDeleteFile = useCallback(
    (id: string) => {
      if (confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
        deleteFile({ id });
      }
    },
    [deleteFile],
  );

  // Filter and sort files
  const filteredAndSortedFiles = useMemo<FileSummary[]>(() => {
    if (!files) return [];

    let filtered: FileSummary[] = [...(files as any)];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "size":
          comparison = Number(a.size) - Number(b.size);
          break;
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });
  }, [files, searchQuery, filters]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          <div className="text-center">
            <div className="relative mx-auto mb-6 h-32 w-32">
              <Image
                src="/brand/states/error.png"
                alt="Error loading documents"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-heading-md mb-2 font-semibold text-foreground">
              Something went wrong
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              We couldn&apos;t load your documents. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center sm:gap-0">
            <div className="space-y-2">
              <h1 className="text-display-lg bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text font-bold text-transparent">
                My Documents
              </h1>
              <p className="text-body-lg text-gray-600 dark:text-gray-300">
                Upload, manage, and chat with your PDF documents
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {files && files.length >= 2 && (
                <MultiDocSelector files={filteredAndSortedFiles.filter((f) => f.uploadStatus === "SUCCESS")} />
              )}
              <UploadButton />
            </div>
          </div>

          {/* Search and Controls */}
          <div className="mt-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search your documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4"
                />
              </div>

              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Sort by {filters.sortBy}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, sortBy: "name" })}>
                      Name
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, sortBy: "date" })}>
                      Date Modified
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, sortBy: "size" })}>
                      File Size
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, sortOrder: "asc" })}>
                      Ascending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, sortOrder: "desc" })}>
                      Descending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center rounded-lg border border-gray-200">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            {files && (
              <div className="text-body-sm flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                <span>
                  {filteredAndSortedFiles.length} document
                  {filteredAndSortedFiles.length !== 1 ? "s" : ""}
                </span>
                {searchQuery && <span>Filtered by &quot;{searchQuery}&quot;</span>}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <DocumentCardSkeleton />
              </div>
            ))}
          </div>
        ) : filteredAndSortedFiles.length > 0 ? (
          <DocumentGrid
            files={filteredAndSortedFiles}
            viewMode={viewMode}
            onDelete={handleDeleteFile}
            onRetry={(fileId) => retryProcessing({ fileId })}
          />
        ) : (
          <div className="py-16">
            <EmptyState
              icon={searchQuery ? Search : Ghost}
              title={searchQuery ? "No documents found" : "No documents yet"}
              description={
                searchQuery
                  ? `No documents match "${searchQuery}". Try adjusting your search.`
                  : "Upload your first PDF document to get started with AI-powered analysis."
              }
              action={
                searchQuery
                  ? {
                    label: "Clear Search",
                    onClick: () => setSearchQuery(""),
                  }
                  : undefined
              }
            />
            {!searchQuery && (
              <div className="mt-4 flex justify-center">
                <UploadZone />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
