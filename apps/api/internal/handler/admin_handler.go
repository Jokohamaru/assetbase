package handler

import (
	"net/http"
	"time"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/pkg/password"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/Jokohamaru/assetbase/prisma/db"
	"github.com/gin-gonic/gin"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

// userResponse is a safe view of db.UserModel that omits passwordHash.
type userResponse struct {
	ID                 string    `json:"id"`
	EmployeeCode       string    `json:"employeeCode"`
	Username           string    `json:"username"`
	FullName           string    `json:"fullName"`
	Email              string    `json:"email"`
	Role               string    `json:"role"`
	Status             string    `json:"status"`
	MustChangePassword bool      `json:"mustChangePassword"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

func toUserResponse(u db.UserModel) userResponse {
	return userResponse{
		ID:                 u.ID,
		EmployeeCode:       u.EmployeeCode,
		Username:           u.Username,
		FullName:           u.FullName,
		Email:              u.Email,
		Role:               string(u.Role),
		Status:             string(u.Status),
		MustChangePassword: u.MustChangePassword,
		CreatedAt:          u.CreatedAt,
		UpdatedAt:          u.UpdatedAt,
	}
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	users, err := database.Client.User.FindMany().Exec(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	result := make([]userResponse, len(users))
	for i, u := range users {
		result[i] = toUserResponse(u)
	}
	response.Success(c, result)
}

func (h *AdminHandler) CreateUser(c *gin.Context) {
	var req struct {
		EmployeeCode string `json:"employeeCode" binding:"required"`
		Username     string `json:"username" binding:"required"`
		FullName     string `json:"fullName" binding:"required"`
		Email        string `json:"email" binding:"required,email"`
		Role         string `json:"role"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	role := db.UserRoleUser
	if req.Role == string(db.UserRoleAdmin) {
		role = db.UserRoleAdmin
	}

	// Set default password to "AssetBase@123"
	defaultHash, err := password.Hash("AssetBase@123", 12)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	user, err := database.Client.User.CreateOne(
		db.User.EmployeeCode.Set(req.EmployeeCode),
		db.User.Username.Set(req.Username),
		db.User.FullName.Set(req.FullName),
		db.User.Email.Set(req.Email),
		db.User.Role.Set(role),
		db.User.PasswordHash.Set(defaultHash),
		db.User.MustChangePassword.Set(true),
	).Exec(c.Request.Context())

	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, toUserResponse(*user))
}

func (h *AdminHandler) UpdateUserStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	status := db.RecordStatusActive
	if req.Status == string(db.RecordStatusInactive) {
		status = db.RecordStatusInactive
	}

	user, err := database.Client.User.FindUnique(
		db.User.ID.Equals(id),
	).Update(
		db.User.Status.Set(status),
	).Exec(c.Request.Context())

	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, toUserResponse(*user))
}

func (h *AdminHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	// Find if there is a Person linked to this user
	person, err := database.Client.Person.FindUnique(
		db.Person.LinkedUserID.Equals(id),
	).Exec(c.Request.Context())

	if err == nil && person != nil {
		// Check if person has assets
		assetCount, err := database.Client.Asset.FindMany(
			db.Asset.CurrentCustodianID.Equals(person.ID),
		).Exec(c.Request.Context())

		if err != nil {
			response.Error(c, http.StatusInternalServerError, err.Error())
			return
		}

		if len(assetCount) > 0 {
			response.Error(c, http.StatusBadRequest, "Không thể xóa người dùng này vì nhân sự tương ứng đang giữ thiết bị. Vui lòng thu hồi thiết bị trước.")
			return
		}

		// Soft delete person
		_, _ = database.Client.Person.FindUnique(
			db.Person.ID.Equals(person.ID),
		).Update(
			db.Person.Status.Set(db.RecordStatusInactive),
		).Exec(c.Request.Context())
	}

	// Delete the user
	_, err = database.Client.User.FindUnique(
		db.User.ID.Equals(id),
	).Delete().Exec(c.Request.Context())

	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "Xóa người dùng thành công"})
}
