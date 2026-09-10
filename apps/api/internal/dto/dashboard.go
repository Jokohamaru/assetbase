package dto

import "time"

type AttentionAssetDTO struct {
	ID            string `json:"id"`
	AssetTag      string `json:"assetTag"`
	Name          string `json:"name"`
	CategoryName  string `json:"categoryName"`
	StatusCode    string `json:"statusCode"`
	StatusName    string `json:"statusName"`
	CustodianName string `json:"custodianName"`
}

type RecentActivityDTO struct {
	ID          string    `json:"id"`
	Action      string    `json:"action"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	ActorName   string    `json:"actorName"`
	CreatedAt   time.Time `json:"createdAt"`
}

type DashboardMetricsResponse struct {
	TotalAssets      int                 `json:"totalAssets"`
	InUseAssets      int                 `json:"inUseAssets"`
	ReadyAssets      int                 `json:"readyAssets"`
	AttentionAssets  int                 `json:"attentionAssets"`
	OverdueAssets    int                 `json:"overdueAssets"`
	AttentionList    []AttentionAssetDTO `json:"attentionList"`
	RecentActivities []RecentActivityDTO `json:"recentActivities"`
}
