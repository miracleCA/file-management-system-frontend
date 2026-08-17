"use client";

import { useCreateFolder } from "@/api/folder";

import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import UploadDropzone from "./uploadDropZone";

interface AddItemModalProps {
  folderId?: string;
  onClose: () => void;
}

export default function AddItemModal({ folderId, onClose }: AddItemModalProps) {
  const [type, setType] = useState<"file" | "folder">("file");
  const [folderName, setFolderName] = useState("");
  const { mutate: createFolder, isPending: isCreatingFolder } = useCreateFolder();

  const handleCreateFolder = () => {
    const name = folderName.trim();

    if (!name) {
      enqueueSnackbar("Please enter a folder name.", {
        variant: "error",
      });

      return;
    }

    createFolder(
      {
        name,
        parentId: folderId,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Folder created successfully.", {
            variant: "success",
          });

          onClose();
        },

        onError: (error: any) => {
          const message = error?.response?.data?.message ?? error?.message ?? "Failed to create folder.";

          enqueueSnackbar(message, {
            variant: "error",
          });
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <div className="mx-auto mt-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{type === "file" ? "Upload files" : "Create folder"}</h2>

            <p className="mt-1 text-sm text-gray-500">{folderId ? "Add items to this folder." : "Add items to My Files."}</p>
          </div>

          <button type="button" onClick={onClose} className="text-xl text-gray-400 hover:text-black">
            ×
          </button>
        </div>

        {/* Type selector */}

        <div className="mb-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setType("file")} className={`rounded-lg border p-3 text-sm ${type === "file" ? "border-black bg-gray-100 font-medium" : "hover:bg-gray-50"}`}>
            Upload files
          </button>

          <button type="button" onClick={() => setType("folder")} className={`rounded-lg border p-3 text-sm ${type === "folder" ? "border-black bg-gray-100 font-medium" : "hover:bg-gray-50"}`}>
            New folder
          </button>
        </div>

        {/* Upload */}

        {type === "file" && <UploadDropzone folderId={folderId} onClose={onClose} />}

        {/* Folder */}

        {type === "folder" && (
          <div>
            <label htmlFor="folder-name" className="mb-2 block text-sm font-medium">
              Folder name
            </label>

            <input
              id="folder-name"
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleCreateFolder();
                }
              }}
              autoFocus
              placeholder="e.g. Documents"
              disabled={isCreatingFolder}
              className="w-full rounded-lg border p-3 outline-none focus:border-black"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onClose} disabled={isCreatingFolder} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                Cancel
              </button>

              <button type="button" onClick={handleCreateFolder} disabled={isCreatingFolder || !folderName.trim()} className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50">
                {isCreatingFolder ? "Creating..." : "Create folder"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
