package main

import (
	"context"
	"log"

	"github.com/Jokohamaru/assetbase/internal/config"
	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/pkg/password"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

func main() {
	cfg := config.Load()
	database.Connect()
	defer database.Disconnect()

	ctx := context.Background()

	hash, err := password.Hash("User@12345", cfg.BcryptCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	user, err := database.Client.User.CreateOne(
		db.User.EmployeeCode.Set("USER001"),
		db.User.Username.Set("testuser"),
		db.User.FullName.Set("Test User"),
		db.User.Email.Set("testuser@assetbase.local"),
		db.User.Role.Set(db.UserRoleUser),
		db.User.MustChangePassword.Set(false),
		db.User.PasswordHash.Set(hash),
	).Exec(ctx)

	if err != nil {
		log.Printf("Failed to create user: %v", err)
	} else {
		log.Printf("User created successfully (username: %s)", user.Username)
	}
}
