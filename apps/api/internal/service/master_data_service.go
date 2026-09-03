package service

import (
	"context"
	"errors"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

type MasterDataService struct{}

func NewMasterDataService() *MasterDataService {
	return &MasterDataService{}
}

// Departments
func (s *MasterDataService) ListDepartments(ctx context.Context) ([]db.DepartmentModel, error) {
	return database.Client.Department.FindMany(
		db.Department.Status.Equals(db.RecordStatusActive),
	).Exec(ctx)
}

func (s *MasterDataService) CreateDepartment(ctx context.Context, code, name string) (*db.DepartmentModel, error) {
	return database.Client.Department.CreateOne(
		db.Department.Code.Set(code),
		db.Department.Name.Set(name),
	).Exec(ctx)
}

// Locations
func (s *MasterDataService) ListLocations(ctx context.Context) ([]db.LocationModel, error) {
	return database.Client.Location.FindMany(
		db.Location.Status.Equals(db.RecordStatusActive),
	).Exec(ctx)
}

func (s *MasterDataService) CreateLocation(ctx context.Context, code, name, locType string) (*db.LocationModel, error) {
	return database.Client.Location.CreateOne(
		db.Location.Code.Set(code),
		db.Location.Name.Set(name),
		db.Location.Type.Set(locType),
	).Exec(ctx)
}

// Categories
func (s *MasterDataService) ListCategories(ctx context.Context) ([]db.AssetCategoryModel, error) {
	return database.Client.AssetCategory.FindMany(
		db.AssetCategory.Status.Equals(db.RecordStatusActive),
	).Exec(ctx)
}

func (s *MasterDataService) CreateCategory(ctx context.Context, code, name string) (*db.AssetCategoryModel, error) {
	return database.Client.AssetCategory.CreateOne(
		db.AssetCategory.Code.Set(code),
		db.AssetCategory.Name.Set(name),
	).Exec(ctx)
}

func (s *MasterDataService) DeleteCategory(ctx context.Context, id string, replacementCategoryId string) error {
	// Check if category has assets
	assets, err := database.Client.Asset.FindMany(
		db.Asset.CategoryID.Equals(id),
	).Exec(ctx)
	if err != nil {
		return err
	}

	if len(assets) > 0 {
		if replacementCategoryId == "" {
			return errors.New("CATEGORY_IN_USE")
		}

		// Reassign assets
		_, err = database.Client.Asset.FindMany(
			db.Asset.CategoryID.Equals(id),
		).Update(
			db.Asset.CategoryID.Set(replacementCategoryId),
		).Exec(ctx)
		if err != nil {
			return err
		}

		// Reassign Product Models
		_, err = database.Client.ProductModel.FindMany(
			db.ProductModel.CategoryID.Equals(id),
		).Update(
			db.ProductModel.CategoryID.Set(replacementCategoryId),
		).Exec(ctx)
		if err != nil {
			return err
		}
	}

	// Delete category
	_, err = database.Client.AssetCategory.FindUnique(
		db.AssetCategory.ID.Equals(id),
	).Delete().Exec(ctx)

	return err
}

// Manufacturers
func (s *MasterDataService) ListManufacturers(ctx context.Context) ([]db.ManufacturerModel, error) {
	return database.Client.Manufacturer.FindMany(
		db.Manufacturer.Status.Equals(db.RecordStatusActive),
	).Exec(ctx)
}

func (s *MasterDataService) CreateManufacturer(ctx context.Context, name string) (*db.ManufacturerModel, error) {
	return database.Client.Manufacturer.CreateOne(
		db.Manufacturer.Name.Set(name),
	).Exec(ctx)
}

// Models
func (s *MasterDataService) ListModels(ctx context.Context) ([]db.ProductModelModel, error) {
	return database.Client.ProductModel.FindMany(
		db.ProductModel.Status.Equals(db.RecordStatusActive),
	).With(
		db.ProductModel.Manufacturer.Fetch(),
		db.ProductModel.Category.Fetch(),
	).Exec(ctx)
}

func (s *MasterDataService) CreateModel(ctx context.Context, name, categoryId, manufacturerId string) (*db.ProductModelModel, error) {
	return database.Client.ProductModel.CreateOne(
		db.ProductModel.Category.Link(db.AssetCategory.ID.Equals(categoryId)),
		db.ProductModel.Manufacturer.Link(db.Manufacturer.ID.Equals(manufacturerId)),
		db.ProductModel.Name.Set(name),
	).Exec(ctx)
}

// Warehouses
func (s *MasterDataService) ListWarehouses(ctx context.Context) ([]db.WarehouseModel, error) {
	return database.Client.Warehouse.FindMany(
		db.Warehouse.Status.Equals(db.RecordStatusActive),
	).With(
		db.Warehouse.Location.Fetch(),
	).Exec(ctx)
}

func (s *MasterDataService) CreateWarehouse(ctx context.Context, code, name string, locationId *string, description string) (*db.WarehouseModel, error) {
	var ops []db.WarehouseSetParam
	if locationId != nil {
		ops = append(ops, db.Warehouse.Location.Link(db.Location.ID.Equals(*locationId)))
	}
	if description != "" {
		ops = append(ops, db.Warehouse.Description.Set(description))
	}
	return database.Client.Warehouse.CreateOne(
		db.Warehouse.Code.Set(code),
		db.Warehouse.Name.Set(name),
		ops...,
	).Exec(ctx)
}

// AssetStatuses
func (s *MasterDataService) ListAssetStatuses(ctx context.Context) ([]db.AssetStatusModel, error) {
	return database.Client.AssetStatus.FindMany().OrderBy(
		db.AssetStatus.SortOrder.Order(db.SortOrderAsc),
	).Exec(ctx)
}
