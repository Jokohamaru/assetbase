package handler

import (
	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	dashboardService *service.DashboardService
}

func NewDashboardHandler(dashboardService *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboardService: dashboardService}
}

func (h *DashboardHandler) GetMetrics(c *gin.Context) {
	metrics, err := h.dashboardService.GetMetrics(c.Request.Context())
	if err != nil {
		response.Error(c, 500, err.Error())
		return
	}
	response.Success(c, metrics)
}
