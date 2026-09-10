import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export interface AttentionAssetDTO {
  id: string;
  assetTag: string;
  name: string;
  categoryName: string;
  statusCode: string;
  statusName: string;
  custodianName: string;
}

export interface RecentActivityDTO {
  id: string;
  action: string;
  title: string;
  description: string;
  actorName: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalAssets: number;
  inUseAssets: number;
  readyAssets: number;
  attentionAssets: number;
  overdueAssets: number;
  attentionList: AttentionAssetDTO[];
  recentActivities: RecentActivityDTO[];
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
