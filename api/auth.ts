import { useMutation, useQuery } from '@tanstack/react-query';
import apiAxios from '.';

const useRegisterUser = () => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiAxios.post('/auth/register', data);
      return response.data;
    },
  });

  return { mutate, isPending, error };
};

const useLoginUser = () => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiAxios.post('/auth/login', data);
      return response.data;
    },
  });

  return { mutate, isPending, error };
};

const useGetUser = (id: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await apiAxios.get(`/users/${id}`);
      return response.data;
    },
  });

  return { data, isPending, error };
};

export { useRegisterUser, useLoginUser, useGetUser };
