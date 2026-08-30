package handler

import (
	"net/http"
	"strconv"

	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type InventoryHandler struct {
	Service *service.InventoryService
}

func NewInventoryHandler(s *service.InventoryService) *InventoryHandler {
	return &InventoryHandler{Service: s}
}

func (h *InventoryHandler) ListSessions(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "20")
	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	sessions, err := h.Service.ListSessions(c.Request.Context(), page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, sessions)
}

func (h *InventoryHandler) GetSession(c *gin.Context) {
	id := c.Param("id")
	session, err := h.Service.GetSessionByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}

	response.Success(c, session)
}

func (h *InventoryHandler) CreateSession(c *gin.Context) {
	var req dto.CreateInventorySessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id") // From Auth middleware
	
	session, err := h.Service.CreateSession(c.Request.Context(), userID, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, session)
}

func (h *InventoryHandler) ScanItem(c *gin.Context) {
	sessionID := c.Param("id")
	var req dto.ScanInventoryItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id")

	item, err := h.Service.ScanItem(c.Request.Context(), sessionID, userID, req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, item)
}

func (h *InventoryHandler) CloseSession(c *gin.Context) {
	sessionID := c.Param("id")

	session, err := h.Service.CloseSession(c.Request.Context(), sessionID)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, session)
}
