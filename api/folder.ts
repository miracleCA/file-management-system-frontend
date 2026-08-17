import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiAxios from '.';
import { FolderResponse, Folder } from '@/types/files';



export const useRootFolder = () => {
  return useQuery<FolderResponse>({
    queryKey: ['folders', 'root'],

    queryFn: async () => {
      const response = await apiAxios.get<FolderResponse>('/folders');

      return response.data;
    },
  });
};


export const useGetFolder = (id?: string) => {
  return useQuery<FolderResponse>({
    queryKey: ['get-folder', id],

    queryFn: async () => {
      const response = await apiAxios.get<FolderResponse>(`/folders/${id}`);

      return response.data;
    },

    enabled: Boolean(id),
  });
};


export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; parentId?: string }) => {
      const response = await apiAxios.post('/folders', data);

      return response.data;
    },

    onSuccess: (_, variables) => {

      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: ['get-folder', variables.parentId],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ['folders', 'root'],
      });

      queryClient.invalidateQueries({
        queryKey: ['get-folder'],
      });
    },
  });
};


export const useUpdateFolder = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await apiAxios.patch(`/folders/${id}`, data);

      return response.data;
    },

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ['folders', 'root'],
      });

      queryClient.invalidateQueries({
        queryKey: ['get-folder'],
      });
    },
  });
};


export const useMoveFolder = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { parentId?: string | null }) => {
      const response = await apiAxios.patch(`/folders/${id}/move`, data);

      return response.data;
    },

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ['folders', 'root'],
      });

      queryClient.invalidateQueries({
        queryKey: ['get-folder'],
      });
    },
  });
};

export const useFolderTree = () => {
  return useQuery({
    queryKey: ['folder-tree'],

    queryFn: async () => {
      const response = await apiAxios.get('/folders/tree');

      return response.data;
    },
  });
};


export const useDeleteFolder = (folderId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiAxios.delete(`/folders/${folderId}`);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['folders', 'root'],
      });
      queryClient.invalidateQueries({
        queryKey: ['get-folder'],
      });
    },
  });
};


