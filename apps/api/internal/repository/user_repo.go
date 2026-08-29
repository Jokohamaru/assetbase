package repository

import (
	"context"
	"time"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/prisma/db"
)

func FindUserByUsername(ctx context.Context, username string) (*db.UserModel, error) {
	return database.Client.User.FindUnique(
		db.User.Username.Equals(username),
	).Exec(ctx)
}

func FindUserByID(ctx context.Context, id string) (*db.UserModel, error) {
	return database.Client.User.FindUnique(
		db.User.ID.Equals(id),
	).Exec(ctx)
}

func UpdateUserPassword(ctx context.Context, id string, hash string) (*db.UserModel, error) {
	return database.Client.User.FindUnique(
		db.User.ID.Equals(id),
	).Update(
		db.User.PasswordHash.Set(hash),
		db.User.MustChangePassword.Set(false),
	).Exec(ctx)
}

func CreateAuthSession(ctx context.Context, userID string, tokenHash string, expiresAt time.Time) (*db.AuthSessionModel, error) {
	return database.Client.AuthSession.CreateOne(
		db.AuthSession.TokenHash.Set(tokenHash),
		db.AuthSession.User.Link(db.User.ID.Equals(userID)),
		db.AuthSession.ExpiresAt.Set(expiresAt),
	).Exec(ctx)
}

func RevokeAuthSession(ctx context.Context, tokenHash string) error {
	_, err := database.Client.AuthSession.FindUnique(
		db.AuthSession.TokenHash.Equals(tokenHash),
	).Update(
		db.AuthSession.RevokedAt.Set(time.Now()),
	).Exec(ctx)
	return err
}
