package handler

import (
	"net/http"
	"strconv"

	"github.com/Jokohamaru/assetbase/internal/service"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
)

type ImportHandler struct {
	Service *service.ImportService
}

func NewImportHandler(s *service.ImportService) *ImportHandler {
	return &ImportHandler{Service: s}
}

func (h *ImportHandler) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "No file is received")
		return
	}

	userID := c.GetString("user_id")

	batch, err := h.Service.UploadFile(c.Request.Context(), userID, file)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, batch)
}

func (h *ImportHandler) ListBatches(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "20")
	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	batches, err := h.Service.ListBatches(c.Request.Context(), page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, batches)
}

func (h *ImportHandler) GetBatch(c *gin.Context) {
	id := c.Param("id")
	batch, err := h.Service.GetBatch(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}

	response.Success(c, batch)
}

func (h *ImportHandler) GetBatchRows(c *gin.Context) {
	id := c.Param("id")
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "100")
	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	rows, err := h.Service.GetBatchRows(c.Request.Context(), id, page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, rows)
}

func (h *ImportHandler) CommitBatch(c *gin.Context) {
	id := c.Param("id")
	batch, err := h.Service.CommitBatch(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, batch)
}

func (h *ImportHandler) RollbackBatch(c *gin.Context) {
	id := c.Param("id")
	batch, err := h.Service.RollbackBatch(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, batch)
}
