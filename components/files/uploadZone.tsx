"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { useFileUploadComplete, useInitialUploadData } from "@/api/upload";
import { enqueueSnackbar } from "notistack";
import UploadItem, { UploadStatus } from "./uploadItem";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface UploadState {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
}

interface UploadZoneProps {
  folderId?: string;
}

export default function UploadZone({ folderId }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const [uploads, setUploads] = useState<UploadState[]>([]);

  const { mutateAsync: initializeUpload } = useInitialUploadData();

  const { mutateAsync: completeUpload } = useFileUploadComplete();

  const updateUpload = (id: string, update: Partial<UploadState>) => {
    setUploads((current) =>
      current.map((upload) =>
        upload.id === id
          ? {
              ...upload,
              ...update,
            }
          : upload,
      ),
    );
  };

  const uploadFile = async (upload: UploadState) => {
    const { id, file } = upload;

    try {
      updateUpload(id, {
        status: "uploading",
        progress: 0,
      });

      /**
       * STEP 1
       *
       * Ask backend for a presigned URL.
       */
      const response = await initializeUpload({
        filename: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
        folderId,
      });

      const uploadId = response?.uploadId;
      const uploadUrl = response?.uploadUrl;

      if (!uploadId || !uploadUrl) {
        throw new Error("The server did not return a valid upload URL.");
      }

      /**
       * STEP 2
       * Upload directly to MinIO.
       * XHR is used because it exposes upload progress events.
       */

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("PUT", uploadUrl);

        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) {
            return;
          }

          const progress = Math.round((event.loaded / event.total) * 100);

          updateUpload(id, {
            progress,
          });
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
            return;
          }

          reject(new Error("The file could not be uploaded to storage."));
        };

        xhr.onerror = () => {
          reject(new Error("Network error while uploading the file."));
        };

        xhr.onabort = () => {
          reject(new Error("Upload was cancelled."));
        };

        xhr.send(file);
      });

      /**
       * STEP 3
       *
       * Tell the backend that the
       * storage upload completed.
       */
      await completeUpload(uploadId);

      updateUpload(id, {
        progress: 100,
        status: "success",
      });
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? "Upload failed.";

      updateUpload(id, {
        status: "error",
        error: message,
      });
    }
  };

  const startUploads = (files: File[]) => {
    const validFiles: File[] = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        enqueueSnackbar(`"${file.name}" exceeds the 10 MB limit.`, {
          variant: "error",
        });

        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) {
      return;
    }

    const newUploads: UploadState[] = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,

      file,

      progress: 0,

      status: "waiting",
    }));

    setUploads((current) => [...current, ...newUploads]);

    /**
     * Each file gets its own promise.
     *
     * One failed upload does not stop
     * the remaining files.
     */
    newUploads.forEach((upload) => {
      void uploadFile(upload);
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    startUploads(files);

    /*
     * Reset input so selecting the same
     * file again still triggers onChange.
     */
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);

    startUploads(files);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSelectFiles = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleSelectFiles}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${isDragging ? "border-black bg-gray-100" : "border-gray-300 bg-white hover:border-gray-500"}`}
      >
        <div className="text-3xl">☁️</div>

        <h3 className="mt-3 font-medium">Drop files here</h3>

        <p className="mt-1 text-sm text-gray-500">or click to select files</p>

        <p className="mt-2 text-xs text-gray-400">Maximum file size: 10 MB</p>

        <input ref={inputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
      </div>

      {uploads.length > 0 && (
        <div className="space-y-3">
          {uploads.map((upload) => (
            <UploadItem
              key={upload.id}
              file={upload.file}
              progress={upload.progress}
              status={upload.status}
              error={upload.error}
            />
          ))}
        </div>
      )}
    </div>
  );
}
