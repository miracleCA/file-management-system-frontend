"use client";

import { useCreateSharableLink, useDeleteFile, useDownloadFile, useGetActiveShare, useMoveFile, useUpdateFile } from "@/api/file";

import { enqueueSnackbar } from "notistack";
import { useState } from "react";

import MoveFileModal from "./moveFileModal";
import { FolderTreeNode } from "@/types/folder";

interface FileItemProps {
  file: {
    id: string;
    filename: string;
    size: number;
    folderId?: string | null;
    mimeType?: string;
    contentType?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  currentFolderId?: string;
  folders?: FolderTreeNode[];
}

export default function FileItem({ file, currentFolderId, folders = [] }: FileItemProps) {
  const { data: activeShare } = useGetActiveShare(file.id);

  const [editing, setEditing] = useState(false);

  const [filename, setFilename] = useState(file.filename);

  const [showMoveModal, setShowMoveModal] = useState(false);

  const { mutate: updateFile, isPending: isUpdating } = useUpdateFile(file.id);

  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile(file.id);

  const { refetch: fetchDownloadUrl, isFetching: isDownloading } = useDownloadFile(file.id);

  const { mutate: shareFile, isPending: isSharing } = useCreateSharableLink(file.id);

  const handleRename = () => {
    const trimmedName = filename.trim();

    if (!trimmedName) {
      setFilename(file.filename);
      setEditing(false);
      return;
    }

    if (trimmedName === file.filename) {
      setEditing(false);
      return;
    }

    updateFile(
      {
        name: trimmedName,
      },
      {
        onSuccess: () => {
          setEditing(false);

          enqueueSnackbar("File renamed successfully", {
            variant: "success",
          });
        },

        onError: () => {
          setFilename(file.filename);

          setEditing(false);

          enqueueSnackbar("Failed to rename file", {
            variant: "error",
          });
        },
      },
    );
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`Delete "${file.filename}"?`);

    if (!confirmed) return;

    deleteFile(undefined, {
      onSuccess: () => {
        enqueueSnackbar("File deleted successfully", {
          variant: "success",
        });
      },

      onError: (error: any) => {
        enqueueSnackbar(error?.response?.data?.message ?? error?.message ?? "Failed to delete file", {
          variant: "error",
        });
      },
    });
  };

  const handleDownload = async () => {
    try {
      const { data } = await fetchDownloadUrl();

      if (!data?.downloadUrl) {
        throw new Error("Download URL was not returned");
      }

      window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message ?? error?.message ?? "Failed to download file", {
        variant: "error",
      });
    }
  };

  const handleShare = () => {
    shareFile(undefined, {
      onSuccess: async (data) => {
        if (data?.shareUrl) {
          await navigator.clipboard.writeText(data.shareUrl);

          enqueueSnackbar("Share link copied!", {
            variant: "success",
          });

          return;
        }

        enqueueSnackbar("Share link created successfully", {
          variant: "success",
        });
      },

      onError: (error: any) => {
        enqueueSnackbar(error?.response?.data?.message ?? error?.message ?? "Failed to create share link", {
          variant: "error",
        });
      },
    });
  };

  const handleFileClick = async () => {
    try {
      const result = await fetchDownloadUrl();

      const downloadUrl = result.data?.downloadUrl;

      if (!downloadUrl) {
        throw new Error("Download URL was not returned.");
      }

      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message ?? error?.message ?? "Unable to open file.", {
        variant: "error",
      });
    }
  };

  return (
    <>
      <div className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md">
        <div className="mb-3 text-4xl">📄</div>

        {editing ? (
          <input
            autoFocus
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
            onBlur={handleRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleRename();
              }

              if (event.key === "Escape") {
                setFilename(file.filename);
                setEditing(false);
              }
            }}
            className="w-full rounded-lg border px-2 py-1 outline-none focus:border-black"
          />
        ) : (
          <p className="cursor-pointer truncate font-medium" onDoubleClick={() => setEditing(true)} title={file.filename}>
            {file.filename}
          </p>
        )}

        <p className="mt-1 text-sm text-gray-500">{formatFileSize(Number(file.size))}</p>

        {activeShare?.active && (
          <span title="This file has an active share link" className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Shared
          </span>
        )}

        {file.updatedAt && <p className="mt-1 text-xs text-gray-400">Modified {new Date(file.updatedAt).toLocaleDateString()}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            // onClick={
            //     handleDownload
            // }
            onClick={handleFileClick}
            disabled={isDownloading}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {isDownloading ? "Downloading..." : "Download"}
          </button>

          <button type="button" onClick={handleShare} disabled={isSharing} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50">
            {isSharing ? "Sharing..." : "Share"}
          </button>

          <button type="button" onClick={() => setShowMoveModal(true)} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">
            Move
          </button>

          <button type="button" onClick={handleDelete} disabled={isDeleting} className="rounded-lg border px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>

        {isUpdating && <p className="mt-2 text-sm text-gray-500">Renaming...</p>}
      </div>

      {showMoveModal && <MoveFileModal fileId={file.id} folders={folders} currentFolderId={currentFolderId} onClose={() => setShowMoveModal(false)} />}
    </>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
