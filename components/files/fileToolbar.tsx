"use client";

import { useCreateFolder } from "@/api/folder";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";

interface FileToolbarProps {
  folderId?: string;
}

export default function FileToolbar({ folderId }: FileToolbarProps) {
  const [showInput, setShowInput] = useState(false);

  const [name, setName] = useState("");

  const { mutate: createFolder, isPending } = useCreateFolder();

  const handleCreate = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      enqueueSnackbar("Enter a folder name", {
        variant: "error",
      });
      return;
    }

    createFolder(
      {
        name: trimmedName,
        parentId: folderId,
      },
      {
        onSuccess: () => {
          setName("");
          setShowInput(false);

          enqueueSnackbar("Folder created successfully", {
            variant: "success",
          });
        },

        onError: (error: any) => {
          enqueueSnackbar(error?.response?.data?.message ?? error?.message ?? "Failed to create folder", {
            variant: "error",
          });
        },
      },
    );
  };

  if (!showInput) {
    return (
      <button type="button" onClick={() => setShowInput(true)} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
        + New Folder
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleCreate();
          }

          if (event.key === "Escape") {
            setName("");
            setShowInput(false);
          }
        }}
        placeholder="Folder name"
        disabled={isPending}
        className="rounded-lg border px-3 py-2 outline-none focus:border-black"
      />

      <button type="button" onClick={handleCreate} disabled={isPending} className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50">
        {isPending ? "Creating..." : "Create"}
      </button>

      <button
        type="button"
        onClick={() => {
          setName("");
          setShowInput(false);
        }}
        disabled={isPending}
        className="rounded-lg border px-4 py-2 text-sm"
      >
        Cancel
      </button>
    </div>
  );
}
