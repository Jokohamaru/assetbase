package service

import (
	"context"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

type HistoryService struct{}

func NewHistoryService() *HistoryService {
	return &HistoryService{}
}

func (s *HistoryService) ListHistory(ctx context.Context, page, limit int) ([]db.AssetHistoryModel, error) {
	offset := (page - 1) * limit
	return database.Client.AssetHistory.FindMany().Skip(offset).Take(limit).With(
		db.AssetHistory.Asset.Fetch(),
		db.AssetHistory.Actor.Fetch(),
		db.AssetHistory.FromLocation.Fetch(),
		db.AssetHistory.ToLocation.Fetch(),
	).OrderBy(db.AssetHistory.CreatedAt.Order(db.SortOrderDesc)).Exec(ctx)
}
