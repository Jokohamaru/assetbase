package database

import (
	"context"
	"log"
	"time"

	"github.com/Jokohamaru/assetbase/internal/config"
	"github.com/Jokohamaru/assetbase/pkg/password"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

func SeedDemoData(cfg *config.Config) {
	ctx := context.Background()

	// 1. Check if departments already exist (to avoid duplicate demo seeding)
	count, err := Client.Department.FindMany().Take(1).Exec(ctx)
	if err != nil {
		log.Printf("Failed to check existing demo data: %v", err)
		return
	}
	if len(count) > 0 {
		return // DB is not empty
	}

	log.Println("Starting demo data seeding...")

	// 2. Create Departments
	itDept, _ := Client.Department.CreateOne(
		db.Department.Code.Set("DEPT-IT"),
		db.Department.Name.Set("Information Technology"),
	).Exec(ctx)

	hrDept, _ := Client.Department.CreateOne(
		db.Department.Code.Set("DEPT-HR"),
		db.Department.Name.Set("Human Resources"),
	).Exec(ctx)

	financeDept, _ := Client.Department.CreateOne(
		db.Department.Code.Set("DEPT-FIN"),
		db.Department.Name.Set("Finance"),
	).Exec(ctx)

	// 3. Create Users
	hash, _ := password.Hash("Demo@12345", cfg.BcryptCost)

	itUser, _ := Client.User.CreateOne(
		db.User.EmployeeCode.Set("EMP-IT-001"),
		db.User.Username.Set("it.support"),
		db.User.FullName.Set("John IT Support"),
		db.User.Email.Set("it.support@demo.local"),
		db.User.Role.Set(db.UserRoleUser),
		db.User.MustChangePassword.Set(false),
		db.User.PasswordHash.Set(hash),
		db.User.Department.Link(db.Department.ID.Equals(itDept.ID)),
	).Exec(ctx)

	hrUser, _ := Client.User.CreateOne(
		db.User.EmployeeCode.Set("EMP-HR-001"),
		db.User.Username.Set("hr.manager"),
		db.User.FullName.Set("Jane HR Manager"),
		db.User.Email.Set("hr.manager@demo.local"),
		db.User.Role.Set(db.UserRoleUser),
		db.User.MustChangePassword.Set(false),
		db.User.PasswordHash.Set(hash),
		db.User.Department.Link(db.Department.ID.Equals(hrDept.ID)),
	).Exec(ctx)

	// 4. Create Asset Statuses
	statusInUse, _ := Client.AssetStatus.CreateOne(
		db.AssetStatus.Code.Set("IN_USE"),
		db.AssetStatus.Name.Set("Đang sử dụng"),
		db.AssetStatus.Color.Set("#10B981"), // Green
		db.AssetStatus.SortOrder.Set(1),
		db.AssetStatus.IsAssignable.Set(false),
		db.AssetStatus.IsDeployable.Set(false),
	).Exec(ctx)

	statusInStorage, _ := Client.AssetStatus.CreateOne(
		db.AssetStatus.Code.Set("IN_STORAGE"),
		db.AssetStatus.Name.Set("Trong kho"),
		db.AssetStatus.Color.Set("#3B82F6"), // Blue
		db.AssetStatus.SortOrder.Set(2),
		db.AssetStatus.IsAssignable.Set(true),
		db.AssetStatus.IsDeployable.Set(true),
	).Exec(ctx)

	statusMaintenance, _ := Client.AssetStatus.CreateOne(
		db.AssetStatus.Code.Set("MAINTENANCE"),
		db.AssetStatus.Name.Set("Đang bảo trì"),
		db.AssetStatus.Color.Set("#F59E0B"), // Amber
		db.AssetStatus.SortOrder.Set(3),
		db.AssetStatus.IsAssignable.Set(false),
		db.AssetStatus.IsDeployable.Set(false),
	).Exec(ctx)

	// 5. Create Asset Categories
	laptopCat, _ := Client.AssetCategory.CreateOne(
		db.AssetCategory.Code.Set("CAT-LT"),
		db.AssetCategory.Name.Set("Laptops"),
	).Exec(ctx)

	monitorCat, _ := Client.AssetCategory.CreateOne(
		db.AssetCategory.Code.Set("CAT-MN"),
		db.AssetCategory.Name.Set("Monitors"),
	).Exec(ctx)

	// 6. Create Vendor (Wait, checking if Vendor exists. Assuming Vendor model exists based on standard ITAM).
	// But let's check schema for Vendor first before adding it.
	// We know Manufacturer exists.
	dellMan, _ := Client.Manufacturer.CreateOne(
		db.Manufacturer.Name.Set("Dell Vietnam"),
	).Exec(ctx)

	// 7. Create Assets
	now := time.Now()

	// Asset 1: Dell XPS
	if laptopCat != nil && statusInUse != nil && itDept != nil && itUser != nil && dellMan != nil {
		Client.Asset.CreateOne(
			db.Asset.AssetTag.Set("AST-LT-001"),
			db.Asset.Name.Set("Dell XPS 15 9520"),
			db.Asset.Category.Link(db.AssetCategory.ID.Equals(laptopCat.ID)),
			db.Asset.Status.Link(db.AssetStatus.ID.Equals(statusInUse.ID)),
			db.Asset.Manufacturer.Link(db.Manufacturer.ID.Equals(dellMan.ID)),
			db.Asset.Department.Link(db.Department.ID.Equals(itDept.ID)),
			db.Asset.AssignedUser.Link(db.User.ID.Equals(itUser.ID)),
		).Exec(ctx)
	}

	// Asset 2: MacBook Air
	if laptopCat != nil && statusInUse != nil && hrDept != nil && hrUser != nil {
		Client.Asset.CreateOne(
			db.Asset.AssetTag.Set("AST-LT-002"),
			db.Asset.Name.Set("MacBook Air M2"),
			db.Asset.Category.Link(db.AssetCategory.ID.Equals(laptopCat.ID)),
			db.Asset.Status.Link(db.AssetStatus.ID.Equals(statusInUse.ID)),
			db.Asset.Department.Link(db.Department.ID.Equals(hrDept.ID)),
			db.Asset.AssignedUser.Link(db.User.ID.Equals(hrUser.ID)),
		).Exec(ctx)
	}

	// Asset 3: Monitor in Storage
	if monitorCat != nil && statusInStorage != nil && financeDept != nil {
		Client.Asset.CreateOne(
			db.Asset.AssetTag.Set("AST-MN-001"),
			db.Asset.Name.Set("LG UltraSharp 27 inch"),
			db.Asset.Category.Link(db.AssetCategory.ID.Equals(monitorCat.ID)),
			db.Asset.Status.Link(db.AssetStatus.ID.Equals(statusInStorage.ID)),
			db.Asset.Department.Link(db.Department.ID.Equals(financeDept.ID)),
		).Exec(ctx)
	}

	// Asset 4: Laptop in Maintenance
	if laptopCat != nil && statusMaintenance != nil && itDept != nil {
		Client.Asset.CreateOne(
			db.Asset.AssetTag.Set("AST-LT-003"),
			db.Asset.Name.Set("Lenovo ThinkPad T14"),
			db.Asset.Category.Link(db.AssetCategory.ID.Equals(laptopCat.ID)),
			db.Asset.Status.Link(db.AssetStatus.ID.Equals(statusMaintenance.ID)),
			db.Asset.Department.Link(db.Department.ID.Equals(itDept.ID)),
		).Exec(ctx)
	}

	_ = now // to avoid unused variable error if not using dates

	log.Println("Demo data seeded successfully!")
}
