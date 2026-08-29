package service

import (
	"context"

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
		db.ProductModel.Name.Set(name),
		db.ProductModel.Category.Link(db.AssetCategory.ID.Equals(categoryId)),
		db.ProductModel.Manufacturer.Link(db.Manufacturer.ID.Equals(manufacturerId)),
	).Exec(ctx)
}
