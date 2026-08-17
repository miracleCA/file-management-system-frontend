"use client";

import { useMoveFile } from "@/api/file";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { FolderTreeNode } from "@/types/folder";

interface MoveFileModalProps {
  fileId: string;
  folders: FolderTreeNode[];
  currentFolderId?: string;
  onClose: () => void;
}

export default function MoveFileModal({ fileId, folders, currentFolderId, onClose }: MoveFileModalProps) {
  const [destinationFolderId, setDestinationFolderId] = useState(currentFolderId ?? "");

  const { mutate: moveFile, isPending } = useMoveFile(fileId);

  /* Flatten the folder tree so every folder is available in the dropdown. */
  const flattenFolders = (nodes: FolderTreeNode[]): FolderTreeNode[] => {
    const result: FolderTreeNode[] = [];

    for (const node of nodes) {
      result.push(node);

      if (node.children?.length) {
        result.push(...flattenFolders(node.children));
      }
    }

    return result;
  };

  const allFolders = flattenFolders(folders);

  const handleMove = () => {
    if (destinationFolderId === currentFolderId) {
      return;
    }

    moveFile(
      {
        folderId: destinationFolderId || null,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("File moved successfully", {
            variant: "success",
          });

          onClose();
        },

        onError: (error: any) => {
          enqueueSnackbar(error?.response?.data?.message ?? error?.message ?? "Failed to move file", {
            variant: "error",
          });
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Move file</h2>

          <button type="button" onClick={onClose} disabled={isPending} className="text-gray-500 hover:text-black disabled:opacity-50">
            ✕
          </button>
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="destination-folder" className="mb-2 block text-sm font-medium">
            Move to
          </label>

          <select id="destination-folder" value={destinationFolderId} onChange={(event) => setDestinationFolderId(event.target.value)} disabled={isPending} className="w-full rounded border p-3 outline-none focus:border-black">
            {/* Root */}
            <option value="">{currentFolderId === undefined || currentFolderId === null ? "✓ My Files" : "My Files"}</option>

            {allFolders.map((folder) => {
              const isCurrent = folder.id === currentFolderId;

              return (
                <option key={folder.id} value={folder.id} disabled={isCurrent}>
                  {isCurrent ? `✓ ${folder.name}` : folder.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className="rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>

          <button type="button" onClick={handleMove} disabled={isPending || destinationFolderId === currentFolderId} className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
            {isPending ? "Moving..." : "Move"}
          </button>
        </div>
      </div>
    </div>
  );
}
