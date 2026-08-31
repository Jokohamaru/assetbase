package dto

type DashboardMetricsResponse struct {
	TotalAssets     int `json:"totalAssets"`
	InUseAssets     int `json:"inUseAssets"`
	AttentionAssets int `json:"attentionAssets"`
	OverdueAssets   int `json:"overdueAssets"`
}
