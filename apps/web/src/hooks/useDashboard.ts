import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export interface DashboardMetrics {
  totalAssets: number;
  inUseAssets: number;
  attentionAssets: number;
  overdueAssets: number;
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/metrics');
      return response.data.data as DashboardMetrics;
    },
  });
}
