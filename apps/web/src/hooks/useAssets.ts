import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { Asset } from '../types';

const ASSETS_QUERY_KEY = ['assets'];

export function useAssets(params?: { category?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: [...ASSETS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get('/assets', { params });
      return response.data.data || [];
    },
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/assets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useAssignAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.post(`/assets/${id}/assign`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useReturnAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.post(`/assets/${id}/return`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['history', params],
    queryFn: async () => {
      const response = await apiClient.get('/history', { params });
      return response.data.data || [];
    },
  });
}
