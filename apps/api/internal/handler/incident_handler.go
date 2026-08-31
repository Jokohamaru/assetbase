package handler

import (
	"net/http"

	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type IncidentHandler struct {
	Service *service.IncidentService
}

func NewIncidentHandler(s *service.IncidentService) *IncidentHandler {
	return &IncidentHandler{Service: s}
}

func (h *IncidentHandler) CreateIncident(c *gin.Context) {
	var req dto.CreateIncidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id")

	incident, err := h.Service.CreateIncident(c.Request.Context(), userID, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, incident)
}

func (h *IncidentHandler) ListIncidents(c *gin.Context) {
	status := c.Query("status")
	
	incidents, err := h.Service.ListIncidents(c.Request.Context(), status)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, incidents)
}

func (h *IncidentHandler) GetIncident(c *gin.Context) {
	id := c.Param("id")
	incident, err := h.Service.GetIncident(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}

	response.Success(c, incident)
}

func (h *IncidentHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateIncidentStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id")

	incident, err := h.Service.UpdateStatus(c.Request.Context(), id, userID, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, incident)
}

func (h *IncidentHandler) AssignIncident(c *gin.Context) {
	id := c.Param("id")
	var req dto.AssignIncidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID := c.GetString("user_id")

	incident, err := h.Service.AssignIncident(c.Request.Context(), id, userID, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, incident)
}
