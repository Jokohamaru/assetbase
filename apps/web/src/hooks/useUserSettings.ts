import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      const response = await apiClient.put('/auth/password', data);
      return response.data;
    },
  });
}
