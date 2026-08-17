import { FileItem } from './files';

export interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderContents {
  folder: Folder | null;
  folders: Folder[];
  files: FileItem[];
}

export interface FolderTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children: FolderTreeNode[];
}
