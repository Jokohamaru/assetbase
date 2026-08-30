package handler

import (
	"net/http"
	"strconv"

	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type HistoryHandler struct {
	Service *service.HistoryService
}

func NewHistoryHandler(s *service.HistoryService) *HistoryHandler {
	return &HistoryHandler{Service: s}
}

func (h *HistoryHandler) ListHistory(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "50")
	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 50
	}

	data, err := h.Service.ListHistory(c.Request.Context(), page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}
