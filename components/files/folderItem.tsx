"use client";

import { useRouter } from "next/navigation";
import { useDeleteFolder, useMoveFolder, useUpdateFolder, useFolderTree } from "@/api/folder";

import { enqueueSnackbar } from "notistack";
import { useState } from "react";

import MoveFolderModal from "./moveFolderModal";

interface FolderItemProps {
  folder: {
    id: string;
    name: string;
    parentId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };

  currentFolderId?: string;

  availableFolders?: any[];
}

export default function FolderItem({ folder, currentFolderId }: FolderItemProps) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(folder.name);

  const [showMoveModal, setShowMoveModal] = useState(false);

  const { mutate: updateFolder, isPending: isUpdating, error: updateError } = useUpdateFolder(folder.id);

  const { mutate: deleteFolder, isPending: isDeleting, error: deleteError } = useDeleteFolder(folder.id);

  const { data: treeData, isPending: isLoadingTree } = useFolderTree();

  const handleRename = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setName(folder.name);
      setEditing(false);
      return;
    }

    if (trimmedName === folder.name) {
      setEditing(false);
      return;
    }

    updateFolder(
      {
        name: trimmedName,
      },
      {
        onSuccess: () => {
          setEditing(false);

          enqueueSnackbar("Folder renamed successfully", {
            variant: "success",
          });
        },

        onError: () => {
          setName(folder.name);
          setEditing(false);

          enqueueSnackbar("Failed to rename folder", {
            variant: "error",
          });
        },
      },
    );
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`Delete "${folder.name}" and everything inside it?`);

    if (!confirmed) return;

    deleteFolder(undefined, {
      onSuccess: () => {
        enqueueSnackbar("Folder deleted successfully", {
          variant: "success",
        });
      },

      onError: (error: any) => {
        enqueueSnackbar(error?.response?.data?.message ?? error?.message ?? "Failed to delete folder", {
          variant: "error",
        });
      },
    });
  };

  return (
    <>
      <div className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md">
        {/* OPEN FOLDER */}
        {!editing && (
          <div className="cursor-pointer" onClick={() => router.push(`/files/${folder.id}`)}>
            <div className="mb-3 text-4xl">📁</div>

            <p className="truncate font-medium">{folder.name}</p>

            {folder.updatedAt && <p className="mt-1 text-xs text-gray-400">Modified {new Date(folder.updatedAt).toLocaleDateString()}</p>}
          </div>
        )}

        {/* RENAME */}
        {editing && (
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={handleRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleRename();
              }

              if (event.key === "Escape") {
                setName(folder.name);
                setEditing(false);
              }
            }}
            className="w-full rounded-lg border px-2 py-1 outline-none focus:border-black"
          />
        )}

        {/* ACTIONS */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setEditing(true)} disabled={isUpdating || isDeleting} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50">
            Rename
          </button>

          <button type="button" onClick={() => setShowMoveModal(true)} disabled={isUpdating || isDeleting || isLoadingTree} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50">
            {isLoadingTree ? "Loading..." : "Move"}
          </button>

          <button type="button" onClick={handleDelete} disabled={isDeleting || isUpdating} className="rounded-lg border px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>

        {updateError && <p className="mt-2 text-sm text-red-500">Failed to rename folder.</p>}

        {deleteError && <p className="mt-2 text-sm text-red-500">Failed to delete folder.</p>}
      </div>

      {showMoveModal && treeData?.folders && <MoveFolderModal folderId={folder.id} folders={treeData.folders} currentFolderId={currentFolderId} onClose={() => setShowMoveModal(false)} />}
    </>
  );
}
