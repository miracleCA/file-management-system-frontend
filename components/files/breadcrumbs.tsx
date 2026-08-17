"use client";

import { useRouter } from "next/navigation";

interface BreadcrumbsProps {
  folderId?: string;
  folderName?: string;
  parentFolderId?: string | null;
}

export default function Breadcrumbs({ folderId, folderName, parentFolderId }: BreadcrumbsProps) {
  const router = useRouter();

  const handleRootClick = () => {
    router.push("/files");
  };

  const handleParentClick = () => {
    if (!parentFolderId) {
      router.push("/files");
      return;
    }

    router.push(`/files/${parentFolderId}`);
  };

  return (
    <nav className="flex items-center gap-2 text-sm">
      <button type="button" onClick={handleRootClick} className="font-medium text-gray-600 transition hover:text-black">
        My Files
      </button>

      {folderId && (
        <>
          <span className="text-gray-400">/</span>

          {parentFolderId !== undefined && (
            <>
              <button type="button" onClick={handleParentClick} className="text-gray-500 transition hover:text-black">
                Parent
              </button>

              <span className="text-gray-400">/</span>
            </>
          )}

          <span className="font-medium text-gray-900">{folderName ?? "Folder"}</span>
        </>
      )}
    </nav>
  );
}
