package handler

import (
	"net/http"

	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type MasterDataHandler struct {
	Service *service.MasterDataService
}

func NewMasterDataHandler(s *service.MasterDataService) *MasterDataHandler {
	return &MasterDataHandler{Service: s}
}

func (h *MasterDataHandler) ListDepartments(c *gin.Context) {
	data, err := h.Service.ListDepartments(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateDepartment(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateDepartment(c.Request.Context(), req.Code, req.Name)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) ListLocations(c *gin.Context) {
	data, err := h.Service.ListLocations(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateLocation(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
		Name string `json:"name" binding:"required"`
		Type string `json:"type" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateLocation(c.Request.Context(), req.Code, req.Name, req.Type)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) ListCategories(c *gin.Context) {
	data, err := h.Service.ListCategories(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateCategory(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateCategory(c.Request.Context(), req.Code, req.Name)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) ListManufacturers(c *gin.Context) {
	data, err := h.Service.ListManufacturers(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateManufacturer(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateManufacturer(c.Request.Context(), req.Name)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) ListModels(c *gin.Context) {
	data, err := h.Service.ListModels(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateModel(c *gin.Context) {
	var req struct {
		Name           string `json:"name" binding:"required"`
		CategoryId     string `json:"categoryId" binding:"required"`
		ManufacturerId string `json:"manufacturerId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateModel(c.Request.Context(), req.Name, req.CategoryId, req.ManufacturerId)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) ListWarehouses(c *gin.Context) {
	data, err := h.Service.ListWarehouses(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreateWarehouse(c *gin.Context) {
	var req struct {
		Code        string  `json:"code" binding:"required"`
		Name        string  `json:"name" binding:"required"`
		LocationId  *string `json:"locationId"`
		Description string  `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreateWarehouse(c.Request.Context(), req.Code, req.Name, req.LocationId, req.Description)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) ListAssetStatuses(c *gin.Context) {
	data, err := h.Service.ListAssetStatuses(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	// For now, simple delete without reassignment
	err := h.Service.DeleteCategory(c.Request.Context(), id, "")
	if err != nil {
		if err.Error() == "CATEGORY_IN_USE" {
			response.Error(c, http.StatusBadRequest, "không thể xóa danh mục đang có tài sản")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Xóa danh mục thành công"})
}

func (h *MasterDataHandler) ListPeople(c *gin.Context) {
	data, err := h.Service.ListPeople(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, data)
}

func (h *MasterDataHandler) CreatePerson(c *gin.Context) {
	var req struct {
		EmployeeCode string `json:"employeeCode" binding:"required"`
		FullName     string `json:"fullName" binding:"required"`
		Email        string `json:"email"`
		Phone        string `json:"phone"`
		JobTitle     string `json:"jobTitle"`
		DepartmentId string `json:"departmentId" binding:"required"`
		LocationId   string `json:"locationId"`
		LinkedUserId string `json:"linkedUserId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.CreatePerson(c.Request.Context(), req.EmployeeCode, req.FullName, req.Email, req.Phone, req.JobTitle, req.DepartmentId, req.LocationId, req.LinkedUserId)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) UpdatePerson(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		EmployeeCode string `json:"employeeCode"`
		FullName     string `json:"fullName"`
		Email        string `json:"email"`
		Phone        string `json:"phone"`
		JobTitle     string `json:"jobTitle"`
		DepartmentId string `json:"departmentId"`
		LocationId   string `json:"locationId"`
		LinkedUserId string `json:"linkedUserId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	res, err := h.Service.UpdatePerson(c.Request.Context(), id, req.EmployeeCode, req.FullName, req.Email, req.Phone, req.JobTitle, req.DepartmentId, req.LocationId, req.LinkedUserId)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) DeletePerson(c *gin.Context) {
	id := c.Param("id")
	err := h.Service.DeletePerson(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "PERSON_HAS_ASSETS" {
			response.Error(c, http.StatusBadRequest, "Không thể xóa nhân viên đang giữ thiết bị. Vui lòng thu hồi thiết bị trước.")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Xóa nhân viên thành công"})
}

func (h *MasterDataHandler) UpdateDepartment(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Code string `json:"code"`
		Name string `json:"name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	res, err := h.Service.UpdateDepartment(c.Request.Context(), id, req.Code, req.Name)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) DeleteDepartment(c *gin.Context) {
	id := c.Param("id")
	if err := h.Service.DeleteDepartment(c.Request.Context(), id); err != nil {
		if err.Error() == "DEPARTMENT_IN_USE_BY_PEOPLE" {
			response.Error(c, http.StatusBadRequest, "Không thể xóa phòng ban đang có nhân viên")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Xóa thành công"})
}

func (h *MasterDataHandler) UpdateLocation(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Code string `json:"code"`
		Name string `json:"name"`
		Type string `json:"type"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	res, err := h.Service.UpdateLocation(c.Request.Context(), id, req.Code, req.Name, req.Type)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) DeleteLocation(c *gin.Context) {
	id := c.Param("id")
	if err := h.Service.DeleteLocation(c.Request.Context(), id); err != nil {
		if err.Error() == "LOCATION_IN_USE_BY_ASSETS" || err.Error() == "LOCATION_IN_USE_BY_PEOPLE" || err.Error() == "LOCATION_IN_USE_BY_WAREHOUSE" {
			response.Error(c, http.StatusBadRequest, "Không thể xóa vị trí đang được sử dụng")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Xóa thành công"})
}

func (h *MasterDataHandler) UpdateManufacturer(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Name string `json:"name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	res, err := h.Service.UpdateManufacturer(c.Request.Context(), id, req.Name)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) DeleteManufacturer(c *gin.Context) {
	id := c.Param("id")
	if err := h.Service.DeleteManufacturer(c.Request.Context(), id); err != nil {
		if err.Error() == "MANUFACTURER_IN_USE_BY_MODELS" {
			response.Error(c, http.StatusBadRequest, "Không thể xóa NSX đã có dòng máy")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Xóa thành công"})
}

func (h *MasterDataHandler) UpdateWarehouse(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Code        string  `json:"code"`
		Name        string  `json:"name"`
		LocationId  *string `json:"locationId"`
		Description string  `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	res, err := h.Service.UpdateWarehouse(c.Request.Context(), id, req.Code, req.Name, req.LocationId, req.Description)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *MasterDataHandler) DeleteWarehouse(c *gin.Context) {
	id := c.Param("id")
	if err := h.Service.DeleteWarehouse(c.Request.Context(), id); err != nil {
		if err.Error() == "WAREHOUSE_IN_USE_BY_INVENTORIES" {
			response.Error(c, http.StatusBadRequest, "Không thể xóa kho đã có phiên kiểm kê")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Xóa thành công"})
}
