import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiAxios from '.';


export interface CreateShareResponse {
  token: string;
  expiresAt: string;
  shareUrl: string;
}


export const useCreateSharableLink = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data?: { expiresInMinutes?: number }) => {
      const response = await apiAxios.post(`/files/${id}/share`, data ?? {});

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['active-share', id],
      });
    },
  });
};

export const useGetActiveShare = (id: string) => {
  return useQuery({
    queryKey: ['active-share', id],

    queryFn: async () => {
      const response = await apiAxios.get(`/files/${id}/share`);
      return response.data;
    },

    enabled: !!id,
  });
};


export const useUpdateFile = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await apiAxios.patch(`/files/${id}`, data);

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

  return mutation;
};


export const useMoveFile = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { folderId?: string | null }) => {
      const response = await apiAxios.patch(`/files/${id}/move`, data);

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

  return mutation;
};


export const useDownloadFile = (id: string) => {
  return useQuery({
    queryKey: ['download-file', id],

    queryFn: async () => {
      const response = await apiAxios.get(`/files/${id}/download`);

      return response.data;
    },
    enabled: false,
  });
};


export const useDeleteFile = (fileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiAxios.delete(`/files/${fileId}`);

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


