package service

import (
	"context"
	"errors"
	"time"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/prisma/db"
	"github.com/shopspring/decimal"
)

type AssetService struct{}

func NewAssetService() *AssetService {
	return &AssetService{}
}

func (s *AssetService) ListAssets(ctx context.Context, page, limit int, search, category, status, department string) ([]db.AssetModel, error) {
	offset := (page - 1) * limit
	
	// Base condition
	where := []db.AssetWhereParam{
		db.Asset.DeletedAt.IsNull(),
	}

	// Dynamic filters
	if search != "" {
		where = append(where, db.Asset.Or(
			db.Asset.And(
				db.Asset.Name.Contains(search),
				db.Asset.Name.Mode(db.QueryModeInsensitive),
			),
			db.Asset.And(
				db.Asset.AssetTag.Contains(search),
				db.Asset.AssetTag.Mode(db.QueryModeInsensitive),
			),
			db.Asset.And(
				db.Asset.SerialNumber.Contains(search),
				db.Asset.SerialNumber.Mode(db.QueryModeInsensitive),
			),
		))
	}
	
	if category != "" {
		where = append(where, db.Asset.Category.Where(
			db.AssetCategory.Name.Equals(category),
		))
	}
	
	if status != "" {
		where = append(where, db.Asset.Status.Where(
			db.AssetStatus.Code.Equals(status),
		))
	}
	
	if department != "" {
		where = append(where, db.Asset.DepartmentID.Equals(department))
	}

	return database.Client.Asset.FindMany(
		where...,
	).Skip(offset).Take(limit).With(
		db.Asset.Category.Fetch(),
		db.Asset.Model.Fetch(),
		db.Asset.Manufacturer.Fetch(),
		db.Asset.Status.Fetch(),
		db.Asset.Department.Fetch(),
		db.Asset.Location.Fetch(),
		db.Asset.CurrentCustodian.Fetch(),
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
		db.Asset.AssignedUser.Fetch(),
		db.Asset.CurrentCustodian.Fetch(),
		db.Asset.Department.Fetch(),
		db.Asset.Location.Fetch(),
		db.Asset.Warehouse.Fetch(),
		db.Asset.Histories.Fetch().With(
			db.AssetHistory.Actor.Fetch(),
			db.AssetHistory.FromLocation.Fetch(),
			db.AssetHistory.ToLocation.Fetch(),
		).OrderBy(db.AssetHistory.CreatedAt.Order(db.SortOrderDesc)),
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
	if req.PurchaseCost != nil {
		ops = append(ops, db.Asset.PurchaseCost.Set(decimal.NewFromFloat(*req.PurchaseCost)))
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
	if req.ImageUrl != nil {
		ops = append(ops, db.Asset.ImageURL.Set(*req.ImageUrl))
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

func (s *AssetService) UpdateAsset(ctx context.Context, actorID string, id string, req dto.UpdateAssetRequest) (*db.AssetModel, error) {
	// First fetch the asset to see if it exists
	existing, err := database.Client.Asset.FindUnique(
		db.Asset.ID.Equals(id),
	).With(
		db.Asset.Status.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	var ops []db.AssetSetParam
	var historyDesc string

	if req.Name != nil {
		ops = append(ops, db.Asset.Name.Set(*req.Name))
	}
	if req.Barcode != nil {
		ops = append(ops, db.Asset.Barcode.Set(*req.Barcode))
	}
	if req.SerialNumber != nil {
		ops = append(ops, db.Asset.SerialNumber.Set(*req.SerialNumber))
	}
	if req.CategoryId != nil {
		ops = append(ops, db.Asset.Category.Link(db.AssetCategory.ID.Equals(*req.CategoryId)))
	}
	if req.ModelId != nil {
		if *req.ModelId == "" {
			ops = append(ops, db.Asset.Model.Unlink())
		} else {
			ops = append(ops, db.Asset.Model.Link(db.ProductModel.ID.Equals(*req.ModelId)))
		}
	}
	if req.ManufacturerId != nil {
		if *req.ManufacturerId == "" {
			ops = append(ops, db.Asset.Manufacturer.Unlink())
		} else {
			ops = append(ops, db.Asset.Manufacturer.Link(db.Manufacturer.ID.Equals(*req.ManufacturerId)))
		}
	}
	if req.DepartmentId != nil {
		if *req.DepartmentId == "" {
			ops = append(ops, db.Asset.Department.Unlink())
		} else {
			ops = append(ops, db.Asset.Department.Link(db.Department.ID.Equals(*req.DepartmentId)))
		}
	}
	if req.LocationId != nil {
		if *req.LocationId == "" {
			ops = append(ops, db.Asset.Location.Unlink())
		} else {
			ops = append(ops, db.Asset.Location.Link(db.Location.ID.Equals(*req.LocationId)))
		}
	}
	if req.WarehouseId != nil {
		if *req.WarehouseId == "" {
			ops = append(ops, db.Asset.Warehouse.Unlink())
		} else {
			ops = append(ops, db.Asset.Warehouse.Link(db.Warehouse.ID.Equals(*req.WarehouseId)))
		}
	}
	if req.StatusId != nil && *req.StatusId != existing.StatusID {
		if existing.Status().Code == "ACTIVE" {
			return nil, errors.New("Tài sản đang được cấp phát. Vui lòng sử dụng tính năng Thu hồi để đổi trạng thái")
		}

		newStatus, err := database.Client.AssetStatus.FindUnique(
			db.AssetStatus.ID.Equals(*req.StatusId),
		).Exec(ctx)
		if err != nil {
			return nil, errors.New("Trạng thái không hợp lệ")
		}
		if newStatus.Code == "ACTIVE" {
			return nil, errors.New("Vui lòng sử dụng chức năng Cấp phát để đổi trạng thái thành Đang sử dụng")
		}

		ops = append(ops, db.Asset.Status.Link(db.AssetStatus.ID.Equals(*req.StatusId)))
		historyDesc = "Asset status updated"
	}
	if req.PurchaseCost != nil {
		ops = append(ops, db.Asset.PurchaseCost.Set(decimal.NewFromFloat(*req.PurchaseCost)))
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
	if req.ImageUrl != nil {
		ops = append(ops, db.Asset.ImageURL.Set(*req.ImageUrl))
	}

	asset, err := database.Client.Asset.FindUnique(
		db.Asset.ID.Equals(id),
	).Update(ops...).Exec(ctx)

	if err != nil {
		return nil, err
	}

	// Create History if something significant changed
	if historyDesc == "" {
		historyDesc = "Asset updated"
	}
	_, _ = database.Client.AssetHistory.CreateOne(
		db.AssetHistory.Action.Set(db.AssetHistoryActionUpdated),
		db.AssetHistory.Description.Set(historyDesc),
		db.AssetHistory.Asset.Link(db.Asset.ID.Equals(asset.ID)),
		db.AssetHistory.Actor.Link(db.User.ID.Equals(actorID)),
	).Exec(ctx)

	return asset, nil
}

func (s *AssetService) DeleteAsset(ctx context.Context, actorID string, id string) error {
	_, err := database.Client.Asset.FindUnique(
		db.Asset.ID.Equals(id),
	).Update(
		db.Asset.DeletedAt.Set(time.Now()),
	).Exec(ctx)

	if err != nil {
		return err
	}

	// Create History for deletion
	_, _ = database.Client.AssetHistory.CreateOne(
		db.AssetHistory.Action.Set(db.AssetHistoryActionUpdated),
		db.AssetHistory.Description.Set("Asset deleted (soft delete)"),
		db.AssetHistory.Asset.Link(db.Asset.ID.Equals(id)),
		db.AssetHistory.Actor.Link(db.User.ID.Equals(actorID)),
	).Exec(ctx)

	return nil
}
