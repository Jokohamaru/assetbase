import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/departments');
      return response.data.data || [];
    }
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/locations');
      return response.data.data || [];
    }
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/categories');
      return response.data.data || [];
    }
  });
}

export function useManufacturers() {
  return useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/manufacturers');
      return response.data.data || [];
    }
  });
}

export function useAssetStatuses() {
  return useQuery({
    queryKey: ['asset-statuses'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/asset-statuses');
      return response.data.data || [];
    }
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/users');
      return response.data.data || [];
    }
  });
}

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/warehouses');
      return response.data.data || [];
    }
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { code: string; name: string }) => {
      const response = await apiClient.post('/admin/categories', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, replacementCategoryId }: { id: string; replacementCategoryId?: string }) => {
      const response = await apiClient.delete(`/admin/categories/${id}`, {
        params: { replacementCategoryId }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // If categories are reassigned, we should also invalidate assets to reflect changes on AssetBookPage
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });
}
