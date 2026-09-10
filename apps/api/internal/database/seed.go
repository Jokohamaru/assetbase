package database

import (
	"context"
	"log"

	"github.com/Jokohamaru/assetbase/internal/config"
	"github.com/Jokohamaru/assetbase/pkg/password"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

// SeedSystemData tạo các dữ liệu hệ thống bắt buộc cho mọi môi trường.
// An toàn khi chạy nhiều lần — chỉ tạo nếu chưa tồn tại.
func SeedSystemData() {
	ctx := context.Background()

	// 5 trạng thái tài sản chuẩn của hệ thống
	requiredStatuses := []struct {
		Code         string
		Name         string
		Color        string // Hex color
		SortOrder    int
		IsAssignable bool
		IsDeployable bool
	}{
		{"IN_USE", "Đang sử dụng", "#10B981", 1, false, false},
		{"READY", "Sẵn sàng cấp phát", "#3B82F6", 2, true, true},
		{"MAINTENANCE", "Đang bảo trì", "#F59E0B", 3, false, false},
		{"BROKEN", "Hỏng - Chờ xử lý", "#EF4444", 4, false, false},
		{"RETIRED", "Đã thanh lý", "#9CA3AF", 5, false, false},
	}

	for _, s := range requiredStatuses {
		existing, _ := Client.AssetStatus.FindFirst(
			db.AssetStatus.Code.Equals(s.Code),
		).Exec(ctx)
		if existing != nil {
			continue // Đã tồn tại, bỏ qua
		}
		_, err := Client.AssetStatus.CreateOne(
			db.AssetStatus.Code.Set(s.Code),
			db.AssetStatus.Name.Set(s.Name),
			db.AssetStatus.Color.Set(s.Color),
			db.AssetStatus.SortOrder.Set(s.SortOrder),
			db.AssetStatus.IsAssignable.Set(s.IsAssignable),
			db.AssetStatus.IsDeployable.Set(s.IsDeployable),
		).Exec(ctx)
		if err != nil {
			log.Printf("[SystemSeed] Failed to create status [%s]: %v", s.Code, err)
		} else {
			log.Printf("[SystemSeed] Created status: %s", s.Code)
		}
	}
}

func SeedInitialAdmin(cfg *config.Config) {
	ctx := context.Background()

	// Check if any user exists
	count, err := Client.User.FindMany().Exec(ctx)
	if err != nil {
		log.Printf("Failed to check existing users: %v", err)
		return
	}

	if len(count) > 0 {
		return // DB is not empty
	}

	// Create initial admin
	hash, err := password.Hash(cfg.InitialAdminPassword, cfg.BcryptCost)
	if err != nil {
		log.Printf("Failed to hash initial admin password: %v", err)
		return
	}

	admin, err := Client.User.CreateOne(
		db.User.EmployeeCode.Set("ADMIN001"),
		db.User.Username.Set("admin"),
		db.User.FullName.Set("System Administrator"),
		db.User.Email.Set("admin@assetbase.local"),
		db.User.Role.Set(db.UserRoleAdmin),
		db.User.MustChangePassword.Set(true),
		db.User.PasswordHash.Set(hash),
	).Exec(ctx)

	if err != nil {
		log.Printf("Failed to create initial admin: %v", err)
	} else {
		log.Printf("Initial admin created successfully (username: %s)", admin.Username)
	}
}
