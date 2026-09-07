package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type AssetRequestHandler struct {
	Service *service.AssetRequestService
}

func NewAssetRequestHandler(s *service.AssetRequestService) *AssetRequestHandler {
	return &AssetRequestHandler{Service: s}
}

// CreateAssetRequest handles POST /asset-requests
func (h *AssetRequestHandler) CreateAssetRequest(c *gin.Context) {
	var req dto.CreateAssetRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID, _ := c.Get("userID")
	data, err := h.Service.CreateAssetRequest(c.Request.Context(), userID.(string), req)
	if err != nil {
		handleError(c, err)
		return
	}

	response.Success(c, data)
}

// ListMyAssetRequests handles GET /asset-requests/my
func (h *AssetRequestHandler) ListMyAssetRequests(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	userID, _ := c.Get("userID")
	data, err := h.Service.ListMyAssetRequests(c.Request.Context(), userID.(string), page, limit)
	if err != nil {
		handleError(c, err)
		return
	}

	response.Success(c, data)
}

// GetAssetRequest handles GET /asset-requests/:id
func (h *AssetRequestHandler) GetAssetRequest(c *gin.Context) {
	id := c.Param("id")
	data, err := h.Service.GetAssetRequest(c.Request.Context(), id)
	if err != nil {
		handleError(c, err)
		return
	}

	response.Success(c, data)
}

// CancelAssetRequest handles PUT /asset-requests/:id/cancel
func (h *AssetRequestHandler) CancelAssetRequest(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("userID")
	data, err := h.Service.CancelAssetRequest(c.Request.Context(), id, userID.(string))
	if err != nil {
		handleError(c, err)
		return
	}

	response.Success(c, data)
}

// ListAllAssetRequests handles GET /admin/asset-requests
func (h *AssetRequestHandler) ListAllAssetRequests(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	status := c.Query("status")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	var statusParam *string
	if status != "" {
		statusParam = &status
	}

	data, err := h.Service.ListAllAssetRequests(c.Request.Context(), page, limit, statusParam)
	if err != nil {
		handleError(c, err)
		return
	}

	response.Success(c, data)
}

// ApproveAssetRequest handles PUT /admin/asset-requests/:id/approve
func (h *AssetRequestHandler) ApproveAssetRequest(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("userID")

	data, err := h.Service.ApproveAssetRequest(c.Request.Context(), id, userID.(string))
	if err != nil {
		handleError(c, err)
		return
	}

	response.Success(c, data)
}

// RejectAssetRequest handles PUT /admin/asset-requests/:id/reject
func (h *AssetRequestHandler) RejectAssetRequest(c *gin.Context) {
	id := c.Param("id")
	var req dto.RejectAssetRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID, _ := c.Get("userID")
	data, err := h.Service.RejectAssetRequest(c.Request.Context(), id, userID.(string), req.Reason)
	if err != nil {
		handleError(c, err)
		return
	}

	response.Success(c, data)
}

// FulfillAssetRequest handles POST /admin/asset-requests/:id/fulfill
func (h *AssetRequestHandler) FulfillAssetRequest(c *gin.Context) {
	id := c.Param("id")
	var req dto.FulfillAssetRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID, _ := c.Get("userID")
	data, err := h.Service.FulfillAssetRequest(c.Request.Context(), id, userID.(string), req)
	if err != nil {
		handleError(c, err)
		return
	}

	response.Success(c, data)
}

// handleError is a helper function to decide HTTP status based on error message
func handleError(c *gin.Context, err error) {
	errMsg := err.Error()
	if strings.Contains(errMsg, "not found") ||
		strings.Contains(errMsg, "only") ||
		strings.Contains(errMsg, "must be") ||
		strings.Contains(errMsg, "chưa có") {
		response.Error(c, http.StatusBadRequest, errMsg)
	} else {
		response.Error(c, http.StatusInternalServerError, errMsg)
	}
}
