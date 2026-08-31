package handler

import (
	"net/http"

	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type DigitalHandler struct {
	Service *service.DigitalService
}

func NewDigitalHandler(s *service.DigitalService) *DigitalHandler {
	return &DigitalHandler{Service: s}
}

func (h *DigitalHandler) CreateEntitlement(c *gin.Context) {
	var req dto.CreateEntitlementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id")

	entitlement, err := h.Service.CreateEntitlement(c.Request.Context(), userID, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, entitlement)
}

func (h *DigitalHandler) ListEntitlements(c *gin.Context) {
	entType := c.Query("type")
	
	entitlements, err := h.Service.ListEntitlements(c.Request.Context(), entType)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, entitlements)
}

func (h *DigitalHandler) GetEntitlement(c *gin.Context) {
	id := c.Param("id")
	entitlement, err := h.Service.GetEntitlement(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}

	response.Success(c, entitlement)
}

func (h *DigitalHandler) AssignEntitlement(c *gin.Context) {
	id := c.Param("id")
	var req dto.AssignEntitlementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id")

	assignment, err := h.Service.AssignEntitlement(c.Request.Context(), id, userID, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, assignment)
}

func (h *DigitalHandler) RevokeAssignment(c *gin.Context) {
	assignmentId := c.Param("aId")
	
	type revokeReq struct {
		Reason string `json:"reason"`
	}
	var req revokeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id")

	err := h.Service.RevokeAssignment(c.Request.Context(), assignmentId, userID, req.Reason)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, map[string]string{"status": "success"})
}

func (h *DigitalHandler) RenewEntitlement(c *gin.Context) {
	id := c.Param("id")
	var req dto.RenewEntitlementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id")

	renewal, err := h.Service.RenewEntitlement(c.Request.Context(), id, userID, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, renewal)
}
