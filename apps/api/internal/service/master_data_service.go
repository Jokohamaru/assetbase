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

// People
func (s *MasterDataService) ListPeople(ctx context.Context) ([]db.PersonModel, error) {
	return database.Client.Person.FindMany(
		db.Person.Status.Equals(db.RecordStatusActive),
	).
		With(
			db.Person.Department.Fetch(),
			db.Person.Location.Fetch(),
			db.Person.LinkedUser.Fetch(),
		).
		Exec(ctx)
}

func (s *MasterDataService) CreatePerson(ctx context.Context, employeeCode, fullName, email, phone, jobTitle, departmentId, locationId, linkedUserId string) (*db.PersonModel, error) {
	employeeCodeOp := db.Person.EmployeeCode.Set(employeeCode)
	fullNameOp := db.Person.FullName.Set(fullName)
	departmentOp := db.Person.Department.Link(db.Department.ID.Equals(departmentId))
	var ops []db.PersonSetParam

	ops = append(ops, db.Person.Status.Set(db.RecordStatusActive))

	if email != "" {
		ops = append(ops, db.Person.Email.Set(email))
	}
	if phone != "" {
		ops = append(ops, db.Person.Phone.Set(phone))
	}
	if jobTitle != "" {
		ops = append(ops, db.Person.JobTitle.Set(jobTitle))
	}
	if locationId != "" {
		ops = append(ops, db.Person.Location.Link(db.Location.ID.Equals(locationId)))
	}
	if linkedUserId != "" {
		ops = append(ops, db.Person.LinkedUser.Link(db.User.ID.Equals(linkedUserId)))
	}

	person, err := database.Client.Person.CreateOne(employeeCodeOp, fullNameOp, departmentOp, ops...).Exec(ctx)
	if err != nil {
		return nil, err
	}
	return person, nil
}

func (s *MasterDataService) UpdatePerson(ctx context.Context, id, employeeCode, fullName, email, phone, jobTitle, departmentId, locationId, linkedUserId string) (*db.PersonModel, error) {
	var ops []db.PersonSetParam
	if employeeCode != "" {
		ops = append(ops, db.Person.EmployeeCode.Set(employeeCode))
	}
	if fullName != "" {
		ops = append(ops, db.Person.FullName.Set(fullName))
	}
	if departmentId != "" {
		ops = append(ops, db.Person.Department.Link(db.Department.ID.Equals(departmentId)))
	}
	if email != "" {
		ops = append(ops, db.Person.Email.Set(email))
	}
	if phone != "" {
		ops = append(ops, db.Person.Phone.Set(phone))
	}
	if jobTitle != "" {
		ops = append(ops, db.Person.JobTitle.Set(jobTitle))
	}
	if locationId != "" {
		ops = append(ops, db.Person.Location.Link(db.Location.ID.Equals(locationId)))
	}
	if linkedUserId != "" {
		ops = append(ops, db.Person.LinkedUser.Link(db.User.ID.Equals(linkedUserId)))
	}

	person, err := database.Client.Person.FindUnique(
		db.Person.ID.Equals(id),
	).Update(ops...).Exec(ctx)
	if err != nil {
		return nil, err
	}
	return person, nil
}

func (s *MasterDataService) DeletePerson(ctx context.Context, id string) error {
	// Check if the person is holding any assets
	assetCount, err := database.Client.Asset.FindMany(
		db.Asset.CurrentCustodianID.Equals(id),
	).Exec(ctx)

	if err != nil {
		return err
	}

	if len(assetCount) > 0 {
		return errors.New("PERSON_HAS_ASSETS")
	}

	// Fetch person to get linked user
	person, err := database.Client.Person.FindUnique(
		db.Person.ID.Equals(id),
	).Exec(ctx)

	if err != nil {
		return err
	}

	// Soft delete the person
	_, err = database.Client.Person.FindUnique(
		db.Person.ID.Equals(id),
	).Update(
		db.Person.Status.Set(db.RecordStatusInactive),
	).Exec(ctx)

	if err != nil {
		return err
	}

	// Hard delete linked user if exists to prevent login
	userId, hasUser := person.LinkedUserID()
	if hasUser {
		_, _ = database.Client.User.FindUnique(
			db.User.ID.Equals(userId),
		).Delete().Exec(ctx)
	}

	return nil
}

func (s *MasterDataService) UpdateDepartment(ctx context.Context, id, code, name string) (*db.DepartmentModel, error) {
	var ops []db.DepartmentSetParam
	if code != "" {
		ops = append(ops, db.Department.Code.Set(code))
	}
	if name != "" {
		ops = append(ops, db.Department.Name.Set(name))
	}
	return database.Client.Department.FindUnique(db.Department.ID.Equals(id)).Update(ops...).Exec(ctx)
}

func (s *MasterDataService) DeleteDepartment(ctx context.Context, id string) error {
	// Check if people or assets are assigned
	people, err := database.Client.Person.FindMany(db.Person.DepartmentID.Equals(id)).Exec(ctx)
	if err != nil {
		return err
	}
	if len(people) > 0 {
		return errors.New("DEPARTMENT_IN_USE_BY_PEOPLE")
	}

	_, err = database.Client.Department.FindUnique(db.Department.ID.Equals(id)).Delete().Exec(ctx)
	return err
}

func (s *MasterDataService) UpdateLocation(ctx context.Context, id, code, name, locType string) (*db.LocationModel, error) {
	var ops []db.LocationSetParam
	if code != "" {
		ops = append(ops, db.Location.Code.Set(code))
	}
	if name != "" {
		ops = append(ops, db.Location.Name.Set(name))
	}
	if locType != "" {
		ops = append(ops, db.Location.Type.Set(locType))
	}
	return database.Client.Location.FindUnique(db.Location.ID.Equals(id)).Update(ops...).Exec(ctx)
}

func (s *MasterDataService) DeleteLocation(ctx context.Context, id string) error {
	assets, err := database.Client.Asset.FindMany(db.Asset.LocationID.Equals(id)).Exec(ctx)
	if err != nil {
		return err
	}
	if len(assets) > 0 {
		return errors.New("LOCATION_IN_USE_BY_ASSETS")
	}

	people, err := database.Client.Person.FindMany(db.Person.LocationID.Equals(id)).Exec(ctx)
	if err != nil {
		return err
	}
	if len(people) > 0 {
		return errors.New("LOCATION_IN_USE_BY_PEOPLE")
	}

	warehouses, err := database.Client.Warehouse.FindMany(db.Warehouse.LocationID.Equals(id)).Exec(ctx)
	if err != nil {
		return err
	}
	if len(warehouses) > 0 {
		return errors.New("LOCATION_IN_USE_BY_WAREHOUSE")
	}

	_, err = database.Client.Location.FindUnique(db.Location.ID.Equals(id)).Delete().Exec(ctx)
	return err
}

func (s *MasterDataService) UpdateManufacturer(ctx context.Context, id, name string) (*db.ManufacturerModel, error) {
	var ops []db.ManufacturerSetParam
	if name != "" {
		ops = append(ops, db.Manufacturer.Name.Set(name))
	}
	return database.Client.Manufacturer.FindUnique(db.Manufacturer.ID.Equals(id)).Update(ops...).Exec(ctx)
}

func (s *MasterDataService) DeleteManufacturer(ctx context.Context, id string) error {
	models, err := database.Client.ProductModel.FindMany(db.ProductModel.ManufacturerID.Equals(id)).Exec(ctx)
	if err != nil {
		return err
	}
	if len(models) > 0 {
		return errors.New("MANUFACTURER_IN_USE_BY_MODELS")
	}

	_, err = database.Client.Manufacturer.FindUnique(db.Manufacturer.ID.Equals(id)).Delete().Exec(ctx)
	return err
}

func (s *MasterDataService) UpdateWarehouse(ctx context.Context, id, code, name string, locationId *string, description string) (*db.WarehouseModel, error) {
	var ops []db.WarehouseSetParam
	if code != "" {
		ops = append(ops, db.Warehouse.Code.Set(code))
	}
	if name != "" {
		ops = append(ops, db.Warehouse.Name.Set(name))
	}
	if locationId != nil {
		ops = append(ops, db.Warehouse.Location.Link(db.Location.ID.Equals(*locationId)))
	}
	if description != "" {
		ops = append(ops, db.Warehouse.Description.Set(description))
	}

	return database.Client.Warehouse.FindUnique(db.Warehouse.ID.Equals(id)).Update(ops...).Exec(ctx)
}

func (s *MasterDataService) DeleteWarehouse(ctx context.Context, id string) error {
	inventories, err := database.Client.InventorySession.FindMany(db.InventorySession.ScopeWarehouseID.Equals(id)).Exec(ctx)
	if err != nil {
		return err
	}
	if len(inventories) > 0 {
		return errors.New("WAREHOUSE_IN_USE_BY_INVENTORIES")
	}

	_, err = database.Client.Warehouse.FindUnique(db.Warehouse.ID.Equals(id)).Delete().Exec(ctx)
	return err
}
