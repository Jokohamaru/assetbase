package service

import (
	"context"
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
	// Total Assets (excluding deleted)
	allAssets, err := database.Client.Asset.FindMany(
		db.Asset.DeletedAt.IsNull(),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}
	totalAssets := len(allAssets)

	// In Use Assets
	inUseAssets, err := database.Client.Asset.FindMany(
		db.Asset.DeletedAt.IsNull(),
		db.Asset.Status.Where(
			db.AssetStatus.Code.Equals("ACTIVE"),
		),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}
	inUseCount := len(inUseAssets)

	// Attention Assets (Maintenance / Broken)
	attentionAssets, err := database.Client.Asset.FindMany(
		db.Asset.DeletedAt.IsNull(),
		db.Asset.Status.Where(
			db.AssetStatus.Code.In([]string{"MAINTENANCE", "BROKEN"}),
		),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}
	attentionCount := len(attentionAssets)

	// Overdue Assets
	now := time.Now()
	overdueAssignments, err := database.Client.AssetAssignment.FindMany(
		db.AssetAssignment.Status.Equals(db.AssetAssignmentStatusOpen),
		db.AssetAssignment.ExpectedReturnDate.Before(now),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}
	overdueCount := len(overdueAssignments)

	return &dto.DashboardMetricsResponse{
		TotalAssets:     totalAssets,
		InUseAssets:     inUseCount,
		AttentionAssets: attentionCount,
		OverdueAssets:   overdueCount,
	}, nil
}
