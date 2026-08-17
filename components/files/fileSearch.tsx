"use client";

import { useEffect, useState } from "react";

import { useSearchFiles } from "@/api/search";

import FileItem from "./fileItem";

export default function FileSearch() {
  const [query, setQuery] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  /*
   * Small debounce so we don't hit the
   * backend on every keystroke.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isFetching, error } = useSearchFiles(searchQuery);

  const files = data?.files ?? [];

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files..." className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-black" />
      </div>

      {/* Nothing searched yet */}
      {!searchQuery && (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
          <div className="mb-4 text-4xl">🔎</div>

          <h2 className="text-lg font-semibold text-gray-900">Search your files</h2>

          <p className="mt-2 text-sm text-gray-500">Enter a filename above to find files in your account.</p>
        </div>
      )}

      {/* Loading */}
      {searchQuery && (isLoading || isFetching) && <div className="py-10 text-center text-sm text-gray-500">Searching...</div>}

      {/* Error */}
      {searchQuery && !isLoading && error && (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50 px-6 text-center">
          <div className="mb-4 text-4xl">⚠️</div>

          <h2 className="text-lg font-semibold text-red-900">Search failed</h2>

          <p className="mt-2 text-sm text-red-600">We couldn't search your files. Please try again.</p>
        </div>
      )}

      {/* No results */}
      {searchQuery && !isLoading && !isFetching && !error && files.length === 0 && (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
          <div className="mb-4 text-4xl">📭</div>

          <h2 className="text-lg font-semibold text-gray-900">No files found</h2>

          <p className="mt-2 text-sm text-gray-500">
            No files matched "{searchQuery}
            ".
          </p>
        </div>
      )}

      {/* Results */}
      {files.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Search results</h2>

            <p className="text-sm text-gray-500">
              {files.length} {files.length === 1 ? "file" : "files"} found
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
              <FileItem key={file.id} file={file} currentFolderId={file.folderId ?? undefined} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
