package handler

import (
	"net/http"

	"github.com/Jokohamaru/assetbase/internal/dto"
	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type VendorHandler struct {
	vendorService *service.VendorService
}

func NewVendorHandler(vendorService *service.VendorService) *VendorHandler {
	return &VendorHandler{vendorService: vendorService}
}

func (h *VendorHandler) CreateVendor(c *gin.Context) {
	var req dto.CreateVendorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Dữ liệu đầu vào không hợp lệ")
		return
	}

	vendor, err := h.vendorService.CreateVendor(c.Request.Context(), req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Lỗi khi tạo nhà cung cấp")
		return
	}
	response.Success(c, vendor)
}

func (h *VendorHandler) ListVendors(c *gin.Context) {
	category := c.Query("category")
	status := c.Query("status")

	vendors, err := h.vendorService.ListVendors(c.Request.Context(), category, status)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Lỗi khi lấy danh sách nhà cung cấp")
		return
	}
	response.Success(c, vendors)
}

func (h *VendorHandler) GetVendor(c *gin.Context) {
	id := c.Param("id")
	vendor, err := h.vendorService.GetVendor(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Không tìm thấy nhà cung cấp")
		return
	}
	response.Success(c, vendor)
}

func (h *VendorHandler) UpdateVendor(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateVendorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Dữ liệu đầu vào không hợp lệ")
		return
	}

	vendor, err := h.vendorService.UpdateVendor(c.Request.Context(), id, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Lỗi khi cập nhật nhà cung cấp")
		return
	}
	response.Success(c, vendor)
}

func (h *VendorHandler) EvaluateVendor(c *gin.Context) {
	id := c.Param("id")
	var req dto.EvaluateVendorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Dữ liệu đầu vào không hợp lệ")
		return
	}

	vendor, err := h.vendorService.EvaluateVendor(c.Request.Context(), id, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Lỗi khi đánh giá nhà cung cấp")
		return
	}
	response.Success(c, vendor)
}
