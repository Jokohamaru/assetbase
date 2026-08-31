package handler

import (
	"net/http"

	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type RiskHandler struct {
	riskService *service.RiskService
}

func NewRiskHandler(riskService *service.RiskService) *RiskHandler {
	return &RiskHandler{riskService: riskService}
}

func (h *RiskHandler) CreateAssessment(c *gin.Context) {
	var req dto.CreateRiskAssessmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Dữ liệu đầu vào không hợp lệ")
		return
	}

	userId := c.GetString("userId")
	assessment, err := h.riskService.CreateAssessment(c.Request.Context(), req, userId)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, assessment)
}

func (h *RiskHandler) ListAssessments(c *gin.Context) {
	assessments, err := h.riskService.ListAssessments(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Lỗi khi lấy danh sách đánh giá rủi ro")
		return
	}
	response.Success(c, assessments)
}

func (h *RiskHandler) GetAssessment(c *gin.Context) {
	id := c.Param("id")
	assessment, err := h.riskService.GetAssessment(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Không tìm thấy đánh giá rủi ro")
		return
	}
	response.Success(c, assessment)
}

func (h *RiskHandler) UpdateAssessmentStatus(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateRiskAssessmentStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Dữ liệu trạng thái không hợp lệ")
		return
	}

	assessment, err := h.riskService.UpdateAssessmentStatus(c.Request.Context(), id, req.Status)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Lỗi cập nhật trạng thái")
		return
	}
	response.Success(c, assessment)
}

func (h *RiskHandler) CreateRiskItem(c *gin.Context) {
	assessmentID := c.Param("id")
	var req dto.CreateRiskItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Dữ liệu rủi ro không hợp lệ")
		return
	}

	userId := c.GetString("userId")
	item, err := h.riskService.CreateRiskItem(c.Request.Context(), assessmentID, req, userId)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, item)
}

func (h *RiskHandler) UpdateRiskTreatment(c *gin.Context) {
	itemId := c.Param("itemId")
	var req dto.UpdateRiskTreatmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Dữ liệu chiến lược xử lý không hợp lệ")
		return
	}

	item, err := h.riskService.UpdateRiskTreatment(c.Request.Context(), itemId, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Lỗi cập nhật xử lý rủi ro")
		return
	}
	response.Success(c, item)
}
