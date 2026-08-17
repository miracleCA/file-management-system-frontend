"use client";

import { useFileUploadComplete, useInitialUploadData } from "@/api/upload";
import { enqueueSnackbar } from "notistack";
import { useRef, useState } from "react";

interface UploadDropzoneProps {
  folderId?: string;
  onClose: () => void;
}

type UploadStatus = "pending" | "uploading" | "completing" | "success" | "error";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

function getErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadDropzone({ folderId, onClose }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const { mutateAsync: initializeUpload } = useInitialUploadData();

  const { mutateAsync: completeUpload } = useFileUploadComplete();

  const updateUpload = (id: string, updates: Partial<UploadItem>) => {
    setUploads((current) =>
      current.map((upload) =>
        upload.id === id
          ? {
              ...upload,
              ...updates,
            }
          : upload,
      ),
    );
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} is larger than the 10 MB limit.`;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name} is not supported. Only images and PDF files are allowed.`;
    }

    return null;
  };

  const uploadToStorage = (uploadId: string, uploadUrl: string, file: File, localId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("PUT", uploadUrl, true);

      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }

        const progress = Math.round((event.loaded / event.total) * 100);

        updateUpload(localId, {
          progress,
          status: "uploading",
        });
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
          return;
        }

        reject(new Error(`Storage upload failed with status ${xhr.status}`));
      };

      xhr.onerror = () => {
        reject(new Error("Network error while uploading file"));
      };

      xhr.onabort = () => {
        reject(new Error("Upload was cancelled"));
      };

      xhr.send(file);
    });
  };

  const uploadFile = async (item: UploadItem) => {
    try {
      updateUpload(item.id, {
        status: "uploading",
        progress: 0,
        error: undefined,
      });

      const response = await initializeUpload({
        filename: item.file.name,
        size: item.file.size,
        contentType: item.file.type,
        folderId,
      });

      if (!response?.uploadId || !response?.uploadUrl) {
        throw new Error("The server did not return a valid upload URL.");
      }

      await uploadToStorage(response.uploadId, response.uploadUrl, item.file, item.id);

      updateUpload(item.id, {
        status: "completing",
        progress: 100,
      });

      await completeUpload(response.uploadId);

      updateUpload(item.id, {
        status: "success",
        progress: 100,
      });
    } catch (error: any) {
      updateUpload(item.id, {
        status: "error",
        error: getErrorMessage(error, "Upload failed."),
      });
    }
  };

  const processFiles = (selectedFiles: File[]) => {
    const newUploads: UploadItem[] = [];

    for (const file of selectedFiles) {
      const validationError = validateFile(file);

      const item: UploadItem = {
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: validationError ? "error" : "pending",
        error: validationError ?? undefined,
      };

      newUploads.push(item);
    }

    setUploads((current) => [...current, ...newUploads]);

    /*
     * Start every valid file independently.
     *
     * If one upload fails, the others
     * continue normally.
     */
    for (const item of newUploads) {
      if (item.status === "error") {
        continue;
      }

      void uploadFile(item);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    processFiles(files);

    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);

    if (!files.length) {
      return;
    }

    processFiles(files);
  };

  const hasUploading = uploads.some(
    (upload) => upload.status === "uploading" || upload.status === "completing" || upload.status === "pending",
  );

  const allFinished =
    uploads.length > 0 && uploads.every((upload) => upload.status === "success" || upload.status === "error");

  const successfulUploads = uploads.filter((upload) => upload.status === "success").length;

  const handleClose = () => {
    if (hasUploading) {
      enqueueSnackbar("Please wait for the uploads to finish.", {
        variant: "warning",
      });

      return;
    }

    onClose();
  };

  return (
    <div className="space-y-5">
      {/* DROPZONE */}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => {
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${isDragging ? "border-black bg-gray-100" : "border-gray-300 hover:border-gray-500"}`}
      >
        <div className="text-4xl">☁️</div>
        <p className="mt-3 font-medium">Drop files here</p>
        <p className="mt-1 text-sm text-gray-500">or click to select files</p>
        <p className="mt-2 text-xs text-gray-400">Images and PDF files only · Maximum 10 MB per file</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* UPLOAD LIST */}

      {uploads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Uploads</h3>

            <span className="text-xs text-gray-500">
              {successfulUploads}/{uploads.length} completed
            </span>
          </div>

          {uploads.map((upload) => (
            <div key={upload.id} className="rounded-lg border bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{upload.file.name}</p>

                  <p className="mt-1 text-xs text-gray-500">{formatFileSize(upload.file.size)}</p>
                </div>

                <div className="shrink-0 text-xs">
                  {upload.status === "pending" && <span className="text-gray-500">Waiting</span>}

                  {upload.status === "uploading" && <span className="text-gray-600">{upload.progress}%</span>}

                  {upload.status === "completing" && <span className="text-gray-600">Completing...</span>}

                  {upload.status === "success" && <span className="font-medium text-green-600">✓ Uploaded</span>}

                  {upload.status === "error" && <span className="font-medium text-red-600">Failed</span>}
                </div>
              </div>

              {/* PROGRESS BAR */}

              {(upload.status === "uploading" || upload.status === "completing") && (
                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-black transition-all"
                      style={{
                        width: `${upload.progress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ERROR */}

              {upload.status === "error" && upload.error && <p className="mt-2 text-xs text-red-600">{upload.error}</p>}
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={handleClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
          {allFinished ? "Close" : "Cancel"}
        </button>
      </div>
    </div>
  );
}
