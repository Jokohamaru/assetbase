package handler

import (
	"net/http"

	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	Service *service.AuthService
}

func NewAuthHandler(s *service.AuthService) *AuthHandler {
	return &AuthHandler{Service: s}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, token, err := h.Service.Login(c.Request.Context(), req)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	// Set HttpOnly Cookie
	c.SetCookie("assetbase_session", token, h.Service.Cfg.JWTExpiryHours*3600, "/", "", false, true)

	response.Success(c, res)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	cookie, err := c.Cookie("assetbase_session")
	if err == nil {
		_ = h.Service.Logout(c.Request.Context(), cookie)
	}

	c.SetCookie("assetbase_session", "", -1, "/", "", false, true)
	response.Success(c, nil)
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID := c.GetString("userID")
	if err := h.Service.ChangePassword(c.Request.Context(), userID, req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, nil)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID := c.GetString("userID")
	res, err := h.Service.GetMe(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}

	response.Success(c, res)
}
