import { FolderTreeNode } from "@/types/folder";

export interface FolderOption {
  id: string;
  name: string;
  depth: number;
}

export function flattenFolderTree(folders: FolderTreeNode[], excludedFolderId?: string): FolderOption[] {
  const result: FolderOption[] = [];

  const walk = (nodes: FolderTreeNode[], depth: number) => {
    for (const folder of nodes) {
      if (folder.id === excludedFolderId) {
        continue;
      }

      result.push({
        id: folder.id,
        name: folder.name,
        depth,
      });

      walk(folder.children, depth + 1);
    }
  };

  walk(folders, 0);

  return result;
}
