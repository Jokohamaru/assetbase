package service

import (
	"context"
	"errors"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

type AssetService struct{}

func NewAssetService() *AssetService {
	return &AssetService{}
}

func (s *AssetService) ListAssets(ctx context.Context, page, limit int) ([]db.AssetModel, error) {
	offset := (page - 1) * limit
	return database.Client.Asset.FindMany(
		db.Asset.DeletedAt.IsNull(),
	).Skip(offset).Take(limit).With(
		db.Asset.Category.Fetch(),
		db.Asset.Model.Fetch(),
		db.Asset.Manufacturer.Fetch(),
		db.Asset.Status.Fetch(),
	).Exec(ctx)
}

func (s *AssetService) GetAssetByID(ctx context.Context, id string) (*db.AssetModel, error) {
	asset, err := database.Client.Asset.FindUnique(
		db.Asset.ID.Equals(id),
	).With(
		db.Asset.Category.Fetch(),
		db.Asset.Model.Fetch(),
		db.Asset.Manufacturer.Fetch(),
		db.Asset.Status.Fetch(),
		db.Asset.Histories.Fetch().OrderBy(db.AssetHistory.CreatedAt.Order(db.SortOrderDesc)),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}
	if _, isDeleted := asset.DeletedAt(); isDeleted {
		return nil, errors.New("asset not found")
	}
	return asset, nil
}

func (s *AssetService) CreateAsset(ctx context.Context, actorID string, req dto.CreateAssetRequest) (*db.AssetModel, error) {
	// Create Asset
	var ops []db.AssetSetParam

	if req.Barcode != nil && *req.Barcode != "" {
		ops = append(ops, db.Asset.Barcode.Set(*req.Barcode))
	} else {
		// Fallback to AssetTag if barcode is not provided, though Prisma schema might have it optional now.
		ops = append(ops, db.Asset.Barcode.Set(req.AssetTag))
	}

	if req.SerialNumber != nil {
		ops = append(ops, db.Asset.SerialNumber.Set(*req.SerialNumber))
	}
	if req.ModelId != nil {
		ops = append(ops, db.Asset.Model.Link(db.ProductModel.ID.Equals(*req.ModelId)))
	}
	if req.ManufacturerId != nil {
		ops = append(ops, db.Asset.Manufacturer.Link(db.Manufacturer.ID.Equals(*req.ManufacturerId)))
	}
	if req.DepartmentId != nil {
		ops = append(ops, db.Asset.Department.Link(db.Department.ID.Equals(*req.DepartmentId)))
	}
	if req.LocationId != nil {
		ops = append(ops, db.Asset.Location.Link(db.Location.ID.Equals(*req.LocationId)))
	}
	if req.WarehouseId != nil {
		ops = append(ops, db.Asset.Warehouse.Link(db.Warehouse.ID.Equals(*req.WarehouseId)))
	}
	if req.WarrantyMonths != nil {
		ops = append(ops, db.Asset.WarrantyMonths.Set(*req.WarrantyMonths))
	}
	if req.Cpu != nil {
		ops = append(ops, db.Asset.CPU.Set(*req.Cpu))
	}
	if req.Ram != nil {
		ops = append(ops, db.Asset.RAM.Set(*req.Ram))
	}
	if req.Storage != nil {
		ops = append(ops, db.Asset.Storage.Set(*req.Storage))
	}
	if req.OperatingSystem != nil {
		ops = append(ops, db.Asset.OperatingSystem.Set(*req.OperatingSystem))
	}
	if req.IpAddress != nil {
		ops = append(ops, db.Asset.IPAddress.Set(*req.IpAddress))
	}
	if req.MacAddress != nil {
		ops = append(ops, db.Asset.MacAddress.Set(*req.MacAddress))
	}
	if req.Notes != nil {
		ops = append(ops, db.Asset.Notes.Set(*req.Notes))
	}

	asset, err := database.Client.Asset.CreateOne(
		db.Asset.AssetTag.Set(req.AssetTag),
		db.Asset.Name.Set(req.Name),
		db.Asset.Category.Link(db.AssetCategory.ID.Equals(req.CategoryId)),
		db.Asset.Status.Link(db.AssetStatus.ID.Equals(req.StatusId)),
		ops...,
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	// Create History
	_, _ = database.Client.AssetHistory.CreateOne(
		db.AssetHistory.Action.Set(db.AssetHistoryActionCreated),
		db.AssetHistory.Description.Set("Asset created"),
		db.AssetHistory.Asset.Link(db.Asset.ID.Equals(asset.ID)),
		db.AssetHistory.Actor.Link(db.User.ID.Equals(actorID)),
	).Exec(ctx)

	return asset, nil
}
