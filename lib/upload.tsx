import { api } from "./api";

import type { UploadInitResponse } from "@/types/files";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} is larger than the 10MB limit.`);
}

export async function initializeUpload(token: string, file: File, folderId: string | null): Promise<UploadInitResponse> {
  return api<UploadInitResponse>("/uploads/init", {
    method: "POST",
    token,

    body: JSON.stringify({
      filename: file.name,
      size: file.size,
      folderId,
    }),
  });
}

export function uploadToStorage(uploadUrl: string, file: File, onProgress: (progress: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const progress = (event.loaded / event.total) * 100;

      onProgress(Math.round(progress));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage upload failed with status ${xhr.status}.`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error while uploading file."));
    };

    xhr.onabort = () => {
      reject(new Error("Upload was cancelled."));
    };

    xhr.send(file);
  });
}

export async function completeUpload(token: string, uploadId: string): Promise<void> {
  await api(`/uploads/${uploadId}/complete`, {
    method: "POST",
    token,
  });
}

export async function uploadFile(token: string, file: File, folderId: string | null, onProgress: (progress: number) => void): Promise<void> {
  validateFile(file);

  const { uploadId, uploadUrl } = await initializeUpload(token, file, folderId);

  await uploadToStorage(uploadUrl, file, onProgress);
  await completeUpload(token, uploadId);
}
