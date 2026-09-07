import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export interface AssetRequest {
  id: string;
  requestNo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED';
  purpose: string;
  description: string;
  assetCategoryId: string;
  assetCategory: string;
  requestedBy: string;
  requestedByName: string;
  approvedAt?: string;
  rejectionReason?: string;
  fulfilledAt?: string;
  assignmentId?: string;
  createdAt: string;
}

export interface AssetRequestListResponse {
  data: AssetRequest[];
  total: number;
  page: number;
  limit: number;
}

// -------------------------------------------------------------
// USER HOOKS
// -------------------------------------------------------------

export function useMyAssetRequests(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['my-asset-requests', page, limit],
    queryFn: async () => {
      const res = await apiClient.get('/asset-requests/my', {
        params: { page, limit }
      });
      return res.data.data as AssetRequestListResponse;
    }
  });
}

export function useCreateAssetRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { assetCategoryId: string; purpose: string; description: string }) => {
      const res = await apiClient.post('/asset-requests', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-asset-requests'] });
    }
  });
}

export function useCancelAssetRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/asset-requests/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-asset-requests'] });
    }
  });
}

// -------------------------------------------------------------
// ADMIN HOOKS
// -------------------------------------------------------------

export function useAdminAssetRequests(status?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin-asset-requests', status, page, limit],
    queryFn: async () => {
      const res = await apiClient.get('/admin/asset-requests', {
        params: { status, page, limit }
      });
      return res.data.data as AssetRequestListResponse;
    }
  });
}

export function useApproveAssetRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/admin/asset-requests/${id}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-asset-requests'] });
    }
  });
}

export function useRejectAssetRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiClient.put(`/admin/asset-requests/${id}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-asset-requests'] });
    }
  });
}

export function useFulfillAssetRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { assetId: string; conditionOut: string } }) => {
      const res = await apiClient.post(`/admin/asset-requests/${id}/fulfill`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });
}
