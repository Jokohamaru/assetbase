package service

import (
	"context"
	"fmt"
	"time"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

type DashboardService struct{}

func NewDashboardService() *DashboardService {
	return &DashboardService{}
}

func (s *DashboardService) GetMetrics(ctx context.Context) (*dto.DashboardMetricsResponse, error) {
	allAssets, err := database.Client.Asset.FindMany(db.Asset.DeletedAt.IsNull()).Exec(ctx)
	if err != nil {
		return nil, err
	}
	totalAssets := len(allAssets)

	inUseAssets, err := database.Client.Asset.FindMany(db.Asset.DeletedAt.IsNull(), db.Asset.Status.Where(db.AssetStatus.Code.Equals("IN_USE"))).Exec(ctx)
	if err != nil {
		return nil, err
	}
	inUseCount := len(inUseAssets)

	readyAssets, err := database.Client.Asset.FindMany(db.Asset.DeletedAt.IsNull(), db.Asset.Status.Where(db.AssetStatus.Code.Equals("READY"))).Exec(ctx)
	if err != nil {
		return nil, err
	}
	readyCount := len(readyAssets)

	attentionAssetsQuery := database.Client.Asset.FindMany(db.Asset.DeletedAt.IsNull(), db.Asset.Status.Where(db.AssetStatus.Code.In([]string{"MAINTENANCE", "BROKEN"})))
	attentionAssets, err := attentionAssetsQuery.Exec(ctx)
	if err != nil {
		return nil, err
	}
	attentionCount := len(attentionAssets)

	attentionListRaw, err := attentionAssetsQuery.With(db.Asset.Category.Fetch(), db.Asset.Status.Fetch(), db.Asset.CurrentCustodian.Fetch()).Take(5).OrderBy(db.Asset.UpdatedAt.Order(db.SortOrderDesc)).Exec(ctx)
	if err != nil {
		return nil, err
	}

	var attentionList []dto.AttentionAssetDTO
	for _, a := range attentionListRaw {
		dtoAsset := dto.AttentionAssetDTO{
			ID:            a.ID,
			AssetTag:      a.AssetTag,
			Name:          a.Name,
			CategoryName:  a.Category().Name,
			StatusCode:    a.Status().Code,
			StatusName:    a.Status().Name,
			CustodianName: "—",
		}
		if custodian, ok := a.CurrentCustodian(); ok {
			dtoAsset.CustodianName = custodian.FullName
		}
		attentionList = append(attentionList, dtoAsset)
	}
	if attentionList == nil {
		attentionList = []dto.AttentionAssetDTO{}
	}

	now := time.Now()
	overdueAssignments, err := database.Client.AssetAssignment.FindMany(db.AssetAssignment.Status.Equals(db.AssetAssignmentStatusOpen), db.AssetAssignment.ExpectedReturnDate.Before(now)).Exec(ctx)
	if err != nil {
		return nil, err
	}
	overdueCount := len(overdueAssignments)

	historyRaw, err := database.Client.AssetHistory.FindMany().With(db.AssetHistory.Asset.Fetch(), db.AssetHistory.Actor.Fetch()).OrderBy(db.AssetHistory.CreatedAt.Order(db.SortOrderDesc)).Take(5).Exec(ctx)
	if err != nil {
		return nil, err
	}

	var recentActivities []dto.RecentActivityDTO
	for _, h := range historyRaw {
		actionStr := string(h.Action)
		title := "Hành động"
		desc := ""

		assetName := h.Asset().Name
		actorName := h.Actor().FullName

		switch actionStr {
		case "CREATED":
			title = "Thêm mới tài sản"
			desc = fmt.Sprintf("Thêm mới %s vào hệ thống", assetName)
		case "ASSIGNED":
			title = "Cấp phát tài sản"
			desc = fmt.Sprintf("Cấp phát %s", assetName)
		case "RETURNED":
			title = "Thu hồi tài sản"
			desc = fmt.Sprintf("Thu hồi %s", assetName)
		case "TRANSFERRED":
			title = "Điều chuyển tài sản"
			desc = fmt.Sprintf("Điều chuyển %s", assetName)
		case "MAINTENANCE":
			title = "Bảo trì"
			desc = fmt.Sprintf("Đưa %s vào bảo trì", assetName)
		case "INVENTORIED":
			title = "Kiểm kê"
			desc = fmt.Sprintf("Kiểm kê %s", assetName)
		case "DISPOSED":
			title = "Thanh lý"
			desc = fmt.Sprintf("Thanh lý %s", assetName)
		case "UPDATED":
			title = "Cập nhật thông tin"
			desc = fmt.Sprintf("Cập nhật thông tin %s", assetName)
		default:
			title = actionStr
			desc = fmt.Sprintf("Thao tác %s trên %s", actionStr, assetName)
		}

		recentActivities = append(recentActivities, dto.RecentActivityDTO{
			ID:          h.ID,
			Action:      actionStr,
			Title:       title,
			Description: desc,
			ActorName:   actorName,
			CreatedAt:   h.CreatedAt,
		})
	}
	if recentActivities == nil {
		recentActivities = []dto.RecentActivityDTO{}
	}

	return &dto.DashboardMetricsResponse{
		TotalAssets:      totalAssets,
		InUseAssets:      inUseCount,
		ReadyAssets:      readyCount,
		AttentionAssets:  attentionCount,
		OverdueAssets:    overdueCount,
		AttentionList:    attentionList,
		RecentActivities: recentActivities,
	}, nil
}
