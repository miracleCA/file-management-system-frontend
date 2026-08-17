export type FileStatus = 'pending' | 'ready' | 'deleted';

export interface FileItem {
  id: string;
  filename: string;
  size: number;
  mimeType?: string;
  contentType?: string;
  status: FileStatus;
  folderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadInitResponse {
  uploadId: string;
  uploadUrl: string;
}

export interface ShareResponse {
  token: string;
  shareUrl?: string;
}

export interface SharedFileResponse {
  downloadUrl: string;
  filename?: string;
}

export interface Breadcrumb {
  id: string;
  name: string;
}

export interface FolderResponse {
  folder: Folder | null;
  folders: Folder[];
  files: FileItem[];
  breadcrumbs?: Breadcrumb[];
}

