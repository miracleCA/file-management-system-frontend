import { useQuery } from '@tanstack/react-query';

import apiAxios from '.';

export interface SearchFile {
  id: string;
  filename: string;
  size: number;
  folderId?: string | null;
  contentType?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchResponse {
  files: SearchFile[];
}

export const useSearchFiles = (query: string) => {
  return useQuery<SearchResponse>({
    queryKey: ['search', query],

    queryFn: async () => {
      const response = await apiAxios.get('/search', {
        params: {
          q: query,
        },
      });

      return response.data;
    },

    enabled: query.trim().length > 0,
  });
};
