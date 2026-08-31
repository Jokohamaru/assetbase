package handler

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"
	"os"

	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

func (h *UploadHandler) UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "No file is received")
		return
	}

	// Basic validation for image type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".gif" && ext != ".webp" {
		response.Error(c, http.StatusBadRequest, "Only image files are allowed")
		return
	}

	// Ensure uploads directory exists
	uploadDir := "./uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.Mkdir(uploadDir, 0755)
	}

	// Generate unique filename
	fileName := fmt.Sprintf("%s-%d%s", uuid.New().String(), time.Now().Unix(), ext)
	dst := filepath.Join(uploadDir, fileName)

	// Save the file
	if err := c.SaveUploadedFile(file, dst); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to save file")
		return
	}

	// Return the relative URL to access the file
	fileURL := fmt.Sprintf("/uploads/%s", fileName)
	response.Success(c, gin.H{
		"url": fileURL,
	})
}
