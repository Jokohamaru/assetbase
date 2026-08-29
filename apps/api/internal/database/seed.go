package database

import (
	"context"
	"log"

	"github.com/Jokohamaru/assetbase/internal/config"
	"github.com/Jokohamaru/assetbase/pkg/password"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

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
