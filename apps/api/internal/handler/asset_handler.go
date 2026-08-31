package handler

import (
	"net/http"
	"strconv"

	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type AssetHandler struct {
	Service *service.AssetService
}

func NewAssetHandler(s *service.AssetService) *AssetHandler {
	return &AssetHandler{Service: s}
}

func (h *AssetHandler) ListAssets(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "20")
	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)
	
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	data, err := h.Service.ListAssets(c.Request.Context(), page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *AssetHandler) GetAsset(c *gin.Context) {
	id := c.Param("id")
	data, err := h.Service.GetAssetByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *AssetHandler) CreateAsset(c *gin.Context) {
	var req dto.CreateAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID, _ := c.Get("userID")
	data, err := h.Service.CreateAsset(c.Request.Context(), userID.(string), req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *AssetHandler) UpdateAsset(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID, _ := c.Get("userID")
	data, err := h.Service.UpdateAsset(c.Request.Context(), userID.(string), id, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}
