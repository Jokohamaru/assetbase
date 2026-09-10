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
      const response = await apiClient.get('/categories');
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

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/people');
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

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/users/${id}`);
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

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/people', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    }
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/admin/people/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    }
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/people/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    }
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await apiClient.post('/admin/departments', data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] })
  });
}
export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => (await apiClient.put(`/admin/departments/${id}`, data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] })
  });
}
export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/admin/departments/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] })
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await apiClient.post('/admin/locations', data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] })
  });
}
export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => (await apiClient.put(`/admin/locations/${id}`, data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] })
  });
}
export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/admin/locations/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] })
  });
}

export function useCreateManufacturer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await apiClient.post('/admin/manufacturers', data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
  });
}
export function useUpdateManufacturer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => (await apiClient.put(`/admin/manufacturers/${id}`, data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
  });
}
export function useDeleteManufacturer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/admin/manufacturers/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await apiClient.post('/admin/warehouses', data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] })
  });
}
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => (await apiClient.put(`/admin/warehouses/${id}`, data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] })
  });
}
export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/admin/warehouses/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] })
  });
}
