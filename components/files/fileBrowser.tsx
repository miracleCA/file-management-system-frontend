"use client";

import { useFolderTree, useGetFolder, useRootFolder } from "@/api/folder";

import { useRouter } from "next/navigation";
import { useState } from "react";

import EmptyState from "./emptyState";
import FolderItem from "./folderItem";
import FileItem from "./fileItem";
import AddItemModal from "./addItemModal";
import FileToolbar from "./fileToolbar";
import FileSearch from "./fileSearch";

type ViewMode = "grid" | "list";

interface FileBrowserProps {
  folderId?: string;
}

export default function FileBrowser({ folderId }: FileBrowserProps) {
  const router = useRouter();

  const rootQuery = useRootFolder();
  const folderQuery = useGetFolder(folderId);
  const folderTreeQuery = useFolderTree();
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data, isPending, error } = folderId ? folderQuery : rootQuery;

  const folders = data?.folders ?? [];
  const files = data?.files ?? [];
  const breadcrumbs = data?.breadcrumbs ?? [];
  const folderTree = folderTreeQuery.data?.folders ?? [];

  if (isPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        <h2 className="font-semibold">Failed to load folder</h2>

        <p className="mt-1 text-sm">Please try again.</p>

        <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white">
          Try again
        </button>
      </div>
    );
  }

  const handleGoUp = () => {
    if (!data?.folder) {
      router.push("/files");
      return;
    }

    if (data.folder.parentId) {
      router.push(`/files/${data.folder.parentId}`);
    } else {
      router.push("/files");
    }
  };

  return (
    <div className="space-y-8">
      <FileSearch />

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Files</h1>

          <p className="mt-1 text-sm text-gray-500">Manage your files and folders</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FileToolbar folderId={folderId} />

          <button type="button" onClick={() => setShowAddModal(true)} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            + Add
          </button>
        </div>
      </div>

      {/* BREADCRUMBS */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <button type="button" onClick={() => router.push("/files")} className="font-medium text-gray-900 hover:underline">
          My Files
        </button>

        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <div key={breadcrumb.id} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>

              {isLast ? (
                <span className="font-medium text-gray-900">{breadcrumb.name}</span>
              ) : (
                <button type="button" onClick={() => router.push(`/files/${breadcrumb.id}`)} className="text-gray-500 hover:text-gray-900 hover:underline">
                  {breadcrumb.name}
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {/* TOOLBAR */}
      <div className="flex items-center justify-between border-b pb-4">
        {folderId ? (
          <button type="button" onClick={handleGoUp} className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50">
            ← Back
          </button>
        ) : (
          <div />
        )}

        <div className="flex rounded-lg border bg-white p-1">
          <button type="button" onClick={() => setViewMode("grid")} className={`rounded px-3 py-1 text-sm ${viewMode === "grid" ? "bg-gray-100 font-medium" : "text-gray-500"}`}>
            Grid
          </button>

          <button type="button" onClick={() => setViewMode("list")} className={`rounded px-3 py-1 text-sm ${viewMode === "list" ? "bg-gray-100 font-medium" : "text-gray-500"}`}>
            List
          </button>
        </div>
      </div>

      {/* EMPTY */}
      {folders.length === 0 && files.length === 0 && <EmptyState title={folderId ? "This folder is empty" : "No files yet"} description={folderId ? "Upload a file or create a folder inside this folder." : "Upload your first file or create a folder to get started."} actionLabel="+ Add" onAction={() => setShowAddModal(true)} icon="📂" />}

      {/* FOLDERS */}
      {folders.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Folders</h2>

            <span className="text-sm text-gray-500">
              {folders.length} {folders.length === 1 ? "folder" : "folders"}
            </span>
          </div>

          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4 md:grid-cols-4" : "space-y-3"}>
            {folders.map((folder) => (
              <FolderItem key={folder.id} folder={folder} currentFolderId={folderId} />
            ))}
          </div>
        </section>
      )}

      {/* FILES */}
      {files.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Files</h2>

            <span className="text-sm text-gray-500">
              {files.length} {files.length === 1 ? "file" : "files"}
            </span>
          </div>

          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4 md:grid-cols-4" : "space-y-3"}>
            {files.map((file) => (
              <FileItem key={file.id} file={file} currentFolderId={folderId} folders={folderTree} />
            ))}
          </div>
        </section>
      )}

      {/* ADD */}
      {showAddModal && <AddItemModal folderId={folderId} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
