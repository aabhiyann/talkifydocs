"use client";

import { useState, useCallback, useMemo } from "react";
import { Search, X, Filter, SortAsc, SortDesc } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

export interface SearchFilters {
  sortBy: "name" | "date" | "size";
  sortOrder: "asc" | "desc";
  fileType?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
  filters?: SearchFilters;
}

export function SearchBar({
  onSearch,
  onFiltersChange,
  placeholder = "Search documents...",
  className = "",
  filters = { sortBy: "date", sortOrder: "desc" },
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      onSearch(searchQuery);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  const handleSortChange = useCallback(
    (sortBy: SearchFilters["sortBy"]) => {
      const newFilters = { ...filters, sortBy };
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleSortOrderToggle = useCallback(() => {
    const newFilters = {
      ...filters,
      sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
    };
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const sortOptions = useMemo(
    () => [
      { value: "date", label: "Date Modified" },
      { value: "name", label: "Name" },
      { value: "size", label: "File Size" },
    ],
    []
  );

  const activeSortOption = useMemo(
    () => sortOptions.find((option) => option.value === filters.sortBy),
    [sortOptions, filters.sortBy]
  );

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className="pl-10 pr-20"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border bg-background p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sort by:</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {activeSortOption?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleSortChange(option.value as SearchFilters["sortBy"])}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSortOrderToggle}
              className="h-8 w-8 p-0"
            >
              {filters.sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
