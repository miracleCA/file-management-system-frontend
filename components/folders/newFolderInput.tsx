"use client";

import { useState } from "react";

export default function NewFolderInput() {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function cancel() {
    setName("");
    setError(null);
    setCreating(false);
  }

  async function submit() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Folder name is required.");
      return;
    }

    setError(null);
    const result = "";
    setError(result ?? "Unable to create folder.");
    cancel();
  }

  if (!creating) {
    return (
      <button onClick={() => setCreating(true)} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
        + New Folder
      </button>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void submit();
            }

            if (event.key === "Escape") {
              cancel();
            }
          }}
          placeholder="Folder name"
          className="rounded-lg border bg-white px-3 py-2 text-sm outline-none"
        />

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
