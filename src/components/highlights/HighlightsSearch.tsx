"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HighlightCard } from "./HighlightCard";
import { Citation } from "@/types/chat";

interface Highlight {
  id: string;
  question: string;
  answer: string;
  citations?: Citation[];
  createdAt: Date | string;
  file: {
    id: string;
    name: string;
  };
}

interface HighlightsSearchProps {
  highlights: Highlight[];
}

export function HighlightsSearch({ highlights }: HighlightsSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Get unique file names
  const uniqueFiles = useMemo(() => {
    const files = new Map<string, string>();
    highlights.forEach((h) => {
      files.set(h.file.id, h.file.name);
    });
    return Array.from(files.entries()).map(([id, name]) => ({ id, name }));
  }, [highlights]);

  // Filter highlights
  const filteredHighlights = useMemo(() => {
    let filtered = highlights;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.question.toLowerCase().includes(query) ||
          h.answer.toLowerCase().includes(query) ||
          h.file.name.toLowerCase().includes(query),
      );
    }

    // Filter by file
    if (selectedFile) {
      filtered = filtered.filter((h) => h.file.id === selectedFile);
    }

    return filtered;
  }, [highlights, searchQuery, selectedFile]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFile(null);
  };

  const hasActiveFilters = searchQuery.trim() || selectedFile !== null;

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search highlights by question, answer, or document name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {uniqueFiles.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedFile === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              All Files
            </Button>
            {uniqueFiles.map((file) => (
              <Button
                key={file.id}
                variant={selectedFile === file.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFile(selectedFile === file.id ? null : file.id)}
              >
                {file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedFile && (
            <Badge variant="secondary" className="gap-1">
              File: {uniqueFiles.find((f) => f.id === selectedFile)?.name}
              <button onClick={() => setSelectedFile(null)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredHighlights.length === highlights.length ? (
          <span>
            {highlights.length} highlight{highlights.length !== 1 ? "s" : ""}
          </span>
        ) : (
          <span>
            Showing {filteredHighlights.length} of {highlights.length} highlight
            {highlights.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Filtered Highlights */}
      {filteredHighlights.length === 0 ? (
        <div className="bg-muted/30 rounded-lg border py-12 text-center">
          <p className="mb-2 text-muted-foreground">No highlights match your filters</p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHighlights.map((highlight) => (
            <HighlightCard key={highlight.id} highlight={highlight} />
          ))}
        </div>
      )}
    </div>
  );
}
