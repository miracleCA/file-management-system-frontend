import { api } from './api';
import type { ShareResponse } from '@/types/files';

export async function createShareLink(token: string, fileId: string): Promise<ShareResponse> {
  return api<ShareResponse>(`/files/${fileId}/share`, {
    method: 'POST',
    token,
  });
}
