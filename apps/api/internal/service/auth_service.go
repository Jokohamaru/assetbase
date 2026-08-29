package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/Jokohamaru/assetbase/internal/config"
	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/internal/repository"
	"github.com/Jokohamaru/assetbase/pkg/jwt"
	"github.com/Jokohamaru/assetbase/pkg/password"
)

type AuthService struct {
	Cfg *config.Config
}

func NewAuthService(cfg *config.Config) *AuthService {
	return &AuthService{Cfg: cfg}
}

func (s *AuthService) Login(ctx context.Context, req dto.LoginRequest) (*dto.LoginResponse, string, error) {
	user, err := repository.FindUserByUsername(ctx, req.Username)
	if err != nil || user == nil {
		return nil, "", errors.New("invalid credentials")
	}

	if user.Status != "ACTIVE" {
		return nil, "", errors.New("user account is inactive")
	}

	pwdHash, _ := user.PasswordHash()
	if !password.Verify(pwdHash, req.Password) {
		return nil, "", errors.New("invalid credentials")
	}

	// Generate JWT
	expiry := time.Duration(s.Cfg.JWTExpiryHours) * time.Hour
	token, err := jwt.Generate(user.ID, user.Username, string(user.Role), s.Cfg.JWTSecret, expiry)
	if err != nil {
		return nil, "", err
	}

	// Store Session
	hash := sha256.Sum256([]byte(token))
	hashStr := hex.EncodeToString(hash[:])
	
	_, err = repository.CreateAuthSession(ctx, user.ID, hashStr, time.Now().Add(expiry))
	if err != nil {
		return nil, "", err
	}

	return &dto.LoginResponse{
		User: dto.UserResponse{
			ID:                 user.ID,
			EmployeeCode:       user.EmployeeCode,
			Username:           user.Username,
			FullName:           user.FullName,
			Email:              user.Email,
			Role:               string(user.Role),
			MustChangePassword: user.MustChangePassword,
		},
		Token: token,
	}, token, nil
}

func (s *AuthService) Logout(ctx context.Context, token string) error {
	hash := sha256.Sum256([]byte(token))
	hashStr := hex.EncodeToString(hash[:])
	return repository.RevokeAuthSession(ctx, hashStr)
}

func (s *AuthService) ChangePassword(ctx context.Context, userID string, req dto.ChangePasswordRequest) error {
	user, err := repository.FindUserByID(ctx, userID)
	if err != nil {
		return errors.New("user not found")
	}

	pwdHash, _ := user.PasswordHash()
	if !password.Verify(pwdHash, req.OldPassword) {
		return errors.New("invalid old password")
	}

	newHash, err := password.Hash(req.NewPassword, s.Cfg.BcryptCost)
	if err != nil {
		return err
	}

	_, err = repository.UpdateUserPassword(ctx, userID, newHash)
	return err
}

func (s *AuthService) GetMe(ctx context.Context, userID string) (*dto.UserResponse, error) {
	user, err := repository.FindUserByID(ctx, userID)
	if err != nil || user == nil {
		return nil, errors.New("user not found")
	}

	return &dto.UserResponse{
		ID:                 user.ID,
		EmployeeCode:       user.EmployeeCode,
		Username:           user.Username,
		FullName:           user.FullName,
		Email:              user.Email,
		Role:               string(user.Role),
		MustChangePassword: user.MustChangePassword,
	}, nil
}
