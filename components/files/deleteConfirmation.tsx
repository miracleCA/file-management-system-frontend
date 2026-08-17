"use client";

interface DeleteConfirmModalProps {
  itemName: string;
  itemType: "file" | "folder";
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({ itemName, itemType, isDeleting = false, onConfirm, onClose }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Delete {itemType}?</h2>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Are you sure you want to delete <span className="font-semibold text-gray-900">"{itemName}"</span>?
        </p>

        {itemType === "folder" && <p className="mt-2 text-sm text-red-600">This will also delete everything inside this folder.</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isDeleting} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>

          <button type="button" onClick={onConfirm} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
