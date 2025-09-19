"use client";

import { trpc } from "@/app/_trpc/client";
import { withCache, cacheKeys, CACHE_TTL } from "@/lib/cache";
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
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "size":
          // Note: File size not available in current schema, using date as fallback
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [files, searchQuery, filters]);

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Document Library
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Manage and interact with your PDF documents
          </p>
        </div>
        <UploadButton />
      </div>

      {/* Search and Filter Bar */}
      <div className="mt-6">
        <SearchBar
          onSearch={setSearchQuery}
          onFiltersChange={setFilters}
          placeholder="Search your documents..."
          filters={filters}
        />
      </div>

      {/* -- Display all the files of the user here -- */}
      {filteredAndSortedFiles && filteredAndSortedFiles.length !== 0 ? (
        <ul
          className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="User files"
        >
          {filteredAndSortedFiles.map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition-all duration-200 hover:shadow-xl hover:scale-[1.02] group"
                role="listitem"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                  aria-label={`Open file ${file.name}`}
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 group-hover:from-cyan-600 group-hover:to-green-600 transition-colors duration-200" />
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text-zinc-900 group-hover:text-blue-600 transition-colors duration-200">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {format(new Date(file.createdAt), "MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="h-4 w-4" />
                    Mocked
                  </div>

                  <Button
                    onClick={() => handleDeleteFile(file.id)}
                    size="sm"
                    className="w-full"
                    variant="destructive"
                    aria-label={`Delete file ${file.name}`}
                  >
                    {currentlyDeletingFile === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DocumentCardSkeleton />
          <DocumentCardSkeleton />
          <DocumentCardSkeleton />
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Ghost className="h-10 w-10 text-zinc-600" />
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
    </main>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
