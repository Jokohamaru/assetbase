package handler

import (
	"net/http"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/Jokohamaru/assetbase/prisma/db"
	"github.com/gin-gonic/gin"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	users, err := database.Client.User.FindMany().Exec(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, users)
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

	user, err := database.Client.User.CreateOne(
		db.User.EmployeeCode.Set(req.EmployeeCode),
		db.User.Username.Set(req.Username),
		db.User.FullName.Set(req.FullName),
		db.User.Email.Set(req.Email),
		db.User.Role.Set(role),
		db.User.MustChangePassword.Set(true),
	).Exec(c.Request.Context())

	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, user)
}
