import { useQuery } from '@tanstack/react-query';
import apiAxios from '.';

export const useAccessShare = (token: string) => {
  return useQuery({
    queryKey: ['access-share'],
    queryFn: async () => {
      const response = await apiAxios.get(`share/${token}`);

      return response.data;
    },
  });
};
