"use client";

export type UploadStatus = "waiting" | "uploading" | "success" | "error";

interface UploadItemProps {
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export default function UploadItem({ file, progress, status, error }: UploadItemProps) {
  const sizeInMb = (file.size / 1024 / 1024).toFixed(2);

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>

          <p className="mt-1 text-xs text-gray-500">{sizeInMb} MB</p>
        </div>

        <div className="shrink-0 text-sm">
          {status === "waiting" && <span className="text-gray-500">Waiting</span>}
          {status === "uploading" && <span className="text-gray-600">{progress}%</span>}
          {status === "success" && <span className="text-green-600">✓ Uploaded</span>}
          {status === "error" && <span className="text-red-600">Failed</span>}
        </div>
      </div>

      {status === "uploading" && (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-black transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-green-500"
              style={{
                width: "100%",
              }}
            />
          </div>
        </div>
      )}

      {status === "error" && error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
