package handler

import (
	"net/http"

	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type MasterDataHandler struct {
	Service *service.MasterDataService
}

func NewMasterDataHandler(s *service.MasterDataService) *MasterDataHandler {
	return &MasterDataHandler{Service: s}
}

func (h *MasterDataHandler) ListDepartments(c *gin.Context) {
	data, err := h.Service.ListDepartments(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateDepartment(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateDepartment(c.Request.Context(), req.Code, req.Name)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) ListLocations(c *gin.Context) {
	data, err := h.Service.ListLocations(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateLocation(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
		Name string `json:"name" binding:"required"`
		Type string `json:"type" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateLocation(c.Request.Context(), req.Code, req.Name, req.Type)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) ListCategories(c *gin.Context) {
	data, err := h.Service.ListCategories(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateCategory(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateCategory(c.Request.Context(), req.Code, req.Name)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}
