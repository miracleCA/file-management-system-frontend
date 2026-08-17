"use client";

import { useMoveFolder } from "@/api/folder";
import { flattenFolderTree } from "./folderTreeOptions";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { FolderTreeNode } from "@/types/folder";

interface MoveFolderModalProps {
  folderId: string;
  folders: FolderTreeNode[];
  currentFolderId?: string | null;
  onClose: () => void;
}

export default function MoveFolderModal({ folderId, folders, currentFolderId, onClose }: MoveFolderModalProps) {
  const [destinationFolderId, setDestinationFolderId] = useState(currentFolderId ?? "");

  const { mutate: moveFolder, isPending } = useMoveFolder(folderId);

  const folderOptions = flattenFolderTree(folders, folderId);

  const handleMove = () => {
    const destination = destinationFolderId || null;

    if (destination === currentFolderId) {
      enqueueSnackbar("Folder is already in this location", {
        variant: "info",
      });

      return;
    }

    moveFolder(
      {
        parentId: destination,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Folder moved successfully", {
            variant: "success",
          });

          onClose();
        },

        onError: (error: any) => {
          enqueueSnackbar(error?.response?.data?.message ?? error?.message ?? "Failed to move folder", {
            variant: "error",
          });
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Move folder</h2>

            <p className="mt-1 text-sm text-gray-500">Select where this folder should live.</p>
          </div>

          <button type="button" onClick={onClose} disabled={isPending} className="text-xl text-gray-400 hover:text-black">
            ×
          </button>
        </div>

        <select value={destinationFolderId} onChange={(event) => setDestinationFolderId(event.target.value)} disabled={isPending} className="w-full rounded-lg border p-3">
          <option value="">My Files</option>

          {folderOptions.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {"  ".repeat(folder.depth)}
              {folder.name}
            </option>
          ))}
        </select>

        <div className="mt-2 text-xs text-gray-500">A folder cannot be moved inside itself or one of its descendants.</div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className="rounded-lg border px-4 py-2">
            Cancel
          </button>

          <button type="button" onClick={handleMove} disabled={isPending} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50">
            {isPending ? "Moving..." : "Move"}
          </button>
        </div>
      </div>
    </div>
  );
}
