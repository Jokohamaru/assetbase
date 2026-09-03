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

func (h *MasterDataHandler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	replacementCategoryId := c.Query("replacementCategoryId")

	err := h.Service.DeleteCategory(c.Request.Context(), id, replacementCategoryId)
	if err != nil {
		if err.Error() == "CATEGORY_IN_USE" {
			response.Error(c, http.StatusBadRequest, "CATEGORY_IN_USE")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Category deleted successfully"})
}

func (h *MasterDataHandler) ListManufacturers(c *gin.Context) {
	data, err := h.Service.ListManufacturers(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateManufacturer(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateManufacturer(c.Request.Context(), req.Name)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) ListModels(c *gin.Context) {
	data, err := h.Service.ListModels(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateModel(c *gin.Context) {
	var req struct {
		Name           string `json:"name" binding:"required"`
		CategoryId     string `json:"categoryId" binding:"required"`
		ManufacturerId string `json:"manufacturerId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateModel(c.Request.Context(), req.Name, req.CategoryId, req.ManufacturerId)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) ListWarehouses(c *gin.Context) {
	data, err := h.Service.ListWarehouses(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateWarehouse(c *gin.Context) {
	var req struct {
		Code        string  `json:"code" binding:"required"`
		Name        string  `json:"name" binding:"required"`
		LocationId  *string `json:"locationId"`
		Description string  `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateWarehouse(c.Request.Context(), req.Code, req.Name, req.LocationId, req.Description)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) ListAssetStatuses(c *gin.Context) {
	data, err := h.Service.ListAssetStatuses(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}
