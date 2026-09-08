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
      // Map it to /incidents endpoint with ticketType=SERVICE_REQUEST and my=true
      const res = await apiClient.get('/incidents', {
        params: { ticketType: 'SERVICE_REQUEST', my: 'true' }
      });
      // The response is { data: Incident[] }. We need to map it back to AssetRequestListResponse
      const incidents = res.data.data || [];
      const mapped = incidents.map((inc: any) => {
        let details: any = {};
        try {
          if (typeof inc.requestDetails === 'string') {
            details = JSON.parse(inc.requestDetails);
          } else if (inc.requestDetails) {
            details = inc.requestDetails;
          }
        } catch(e) {}
        
        return {
          id: inc.id,
          requestNo: inc.incidentNo,
          status: inc.status === 'NEW' ? 'PENDING' : 
                  inc.status === 'IN_PROGRESS' ? 'APPROVED' : 
                  inc.status === 'RESOLVED' ? 'FULFILLED' : 
                  inc.status === 'CANCELLED' ? 'CANCELLED' : inc.status,
          purpose: details.purpose || inc.description,
          description: inc.description,
          assetCategoryId: details.assetCategoryId || '',
          assetCategory: 'Thiết bị IT', // We can't fetch it easily here without population, but it's okay for now
          requestedBy: inc.createdById,
          requestedByName: inc.reporterName,
          createdAt: inc.reportedAt,
        };
      });
      return { data: mapped, total: mapped.length, page, limit } as AssetRequestListResponse;
    }
  });
}

export function useCreateAssetRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { assetCategoryId: string; purpose: string; description: string }) => {
      const payload = {
        title: `Yêu cầu cấp phát: ${data.purpose}`,
        category: 'HARDWARE',
        priority: 'P3',
        impact: 'LOW',
        urgency: 'LOW',
        description: data.description,
        reporterName: 'Self Service',
        ticketType: 'SERVICE_REQUEST',
        requestDetails: {
          assetCategoryId: data.assetCategoryId,
          purpose: data.purpose
        }
      };
      const res = await apiClient.post('/incidents', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    }
  });
}

export function useCancelAssetRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/incidents/${id}/status`, {
        status: 'CANCELLED',
        note: 'Người dùng tự hủy yêu cầu'
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    }
  });
}

// -------------------------------------------------------------
// ADMIN HOOKS (DEPRECATED, but mapped to avoid errors)
// -------------------------------------------------------------

export function useAdminAssetRequests(status?: string, page = 1, limit = 20) {
  // Not heavily used if we merge into IncidentList, but let's map it anyway
  return useQuery({
    queryKey: ['admin-asset-requests', status, page, limit],
    queryFn: async () => {
      let mappedStatus = status;
      if (status === 'PENDING') mappedStatus = 'NEW';
      if (status === 'APPROVED') mappedStatus = 'IN_PROGRESS';
      if (status === 'FULFILLED') mappedStatus = 'RESOLVED';
      
      const res = await apiClient.get('/incidents', {
        params: { ticketType: 'SERVICE_REQUEST', status: mappedStatus }
      });
      return { data: res.data.data || [], total: 0, page, limit } as AssetRequestListResponse;
    }
  });
}

export function useApproveAssetRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/incidents/${id}/status`, {
        status: 'IN_PROGRESS',
        note: 'Đã duyệt yêu cầu, đang xử lý cấp phát.'
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    }
  });
}

export function useRejectAssetRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiClient.put(`/incidents/${id}/status`, {
        status: 'CLOSED',
        note: `Từ chối yêu cầu. Lý do: ${reason}`
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    }
  });
}

export function useFulfillAssetRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { assetId: string; conditionOut: string; note?: string } }) => {
      const res = await apiClient.post(`/incidents/${id}/fulfill`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-asset-requests'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });
}
