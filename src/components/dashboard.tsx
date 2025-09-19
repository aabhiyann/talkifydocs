"use client";

import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import { Ghost, Loader2, MessagesSquare, Plus, Trash } from "lucide-react";
import { DocumentCardSkeleton } from "./ui/skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useState, memo, useCallback, useMemo } from "react";
import { SearchBar, SearchFilters } from "./SearchBar";

const Dashboard = memo(() => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: "date",
    sortOrder: "desc",
  });

  const utils = trpc.useUtils();

  const { data: files, isLoading } = trpc.getUserFiles.useQuery();

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate();
    },
    onMutate: ({ id }) => {
      setCurrentlyDeletingFile(id);
    },
    onSettled: () => {
      setCurrentlyDeletingFile(null);
    },
  });

  const handleDeleteFile = useCallback(
    (id: string) => {
      deleteFile({ id });
    },
    [deleteFile]
  );

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    if (!files) return [];

    let filtered = files;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "size":
          // Note: File size not available in current schema, using date as fallback
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [files, searchQuery, filters]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950/30">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center sm:gap-0">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Document Library
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Manage and interact with your PDF documents
              </p>
            </div>
            <UploadButton />
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-8">
            <SearchBar
              onSearch={setSearchQuery}
              onFiltersChange={setFilters}
              placeholder="Search your documents..."
              filters={filters}
            />
          </div>
        </div>

        {/* Document Grid */}
        {filteredAndSortedFiles && filteredAndSortedFiles.length !== 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="block h-full"
                  aria-label={`Open file ${file.name}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MessagesSquare className="w-6 h-6 text-white" />
                    </div>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteFile(file.id);
                      }}
                      size="sm"
                      variant="destructive"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      aria-label={`Delete file ${file.name}`}
                    >
                      {currentlyDeletingFile === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                        {file.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Uploaded on{" "}
                        {format(new Date(file.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Plus className="h-4 w-4" />
                        <span>Ready to chat</span>
                      </div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Click to open
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Ghost className="h-10 w-10 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-xl text-gray-900">
                No documents found
              </h3>
              <p className="text-gray-600 max-w-md">
                Upload your first PDF document to get started with AI-powered
                analysis and intelligent conversations.
              </p>
            </div>
            <div className="mt-4">
              <UploadButton />
            </div>
          </div>
        )}
      </div>
    </main>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
