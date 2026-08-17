import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import apiAxios from ".";

export interface InitializeUploadData {
  filename: string;
  size: number;
  contentType: string;
  folderId?: string;
}

export interface InitializeUploadResponse {
  uploadId: string;
  uploadUrl: string;
}

export const useInitialUploadData = () => {
  return useMutation<
    InitializeUploadResponse,
    any,
    InitializeUploadData
  >({
    mutationFn: async (data) => {
      const response =
        await apiAxios.post<InitializeUploadResponse>(
          "/uploads/init",
          data,
        );

      return response.data;
    },
  });
};

export const useFileUploadComplete = () => {
  const queryClient = useQueryClient();

  return useMutation<any, any, string>({
    mutationFn: async (id) => {
      const response =
        await apiAxios.post(
          `/uploads/${id}/complete`,
        );

      return response.data;
    },

    onSuccess: () => {
      /*
       * Refresh root contents.
       */
      queryClient.invalidateQueries({
        queryKey: ["folders", "root"],
      });

      /*
       * Refresh whichever folder the user
       * currently has open.
       */
      queryClient.invalidateQueries({
        queryKey: ["get-folder"],
      });
    },
  });
};


