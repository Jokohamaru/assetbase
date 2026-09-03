package dto

type DashboardMetricsResponse struct {
	TotalAssets     int `json:"totalAssets"`
	InUseAssets     int `json:"inUseAssets"`
	ReadyAssets     int `json:"readyAssets"`
	AttentionAssets int `json:"attentionAssets"`
	OverdueAssets   int `json:"overdueAssets"`
}
