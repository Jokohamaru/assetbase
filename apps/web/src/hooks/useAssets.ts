import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { Asset } from '../types';

const ASSETS_QUERY_KEY = ['assets'];

export function useAssets(params?: { category?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: [...ASSETS_QUERY_KEY, params],
    queryFn: async () => {
      // Uncomment and use real API when backend is ready
      // const response = await apiClient.get<Asset[]>('/assets', { params });
      // return response.data;

      // Temporary mock response
      return [] as Asset[];
    },
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAsset: Partial<Asset>) => {
      const response = await apiClient.post<Asset>('/assets', newAsset);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    },
  });
}
