package handler

import (
	"net/http"
	"strings"

	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type LifecycleHandler struct {
	Service *service.LifecycleService
}

func NewLifecycleHandler(s *service.LifecycleService) *LifecycleHandler {
	return &LifecycleHandler{Service: s}
}

func (h *LifecycleHandler) AssignAsset(c *gin.Context) {
	id := c.Param("id")
	var req dto.AssignAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID, _ := c.Get("userID")
	data, err := h.Service.AssignAsset(c.Request.Context(), id, userID.(string), req)
	if err != nil {
		errMsg := err.Error()
		// Validation errors should return 400
		if strings.Contains(errMsg, "not found") || strings.Contains(errMsg, "not in READY status") || strings.Contains(errMsg, "could not be loaded") {
			response.Error(c, http.StatusBadRequest, errMsg)
			return
		}
		response.Error(c, http.StatusInternalServerError, errMsg)
		return
	}
	response.Success(c, data)
}

func (h *LifecycleHandler) ReturnAsset(c *gin.Context) {
	id := c.Param("id")
	var req dto.ReturnAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID, _ := c.Get("userID")
	data, err := h.Service.ReturnAsset(c.Request.Context(), id, userID.(string), req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *LifecycleHandler) TransferAsset(c *gin.Context) {
	id := c.Param("id")
	var req dto.TransferAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	userID, _ := c.Get("userID")
	data, err := h.Service.TransferAsset(c.Request.Context(), id, userID.(string), req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}
