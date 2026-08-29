package pagination

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

type Params struct {
	Page  int
	Limit int
	Skip  int
}

type Meta struct {
	CurrentPage int   `json:"currentPage"`
	PageSize    int   `json:"pageSize"`
	TotalItems  int64 `json:"totalItems"`
	TotalPages  int   `json:"totalPages"`
}

func Parse(c *gin.Context) Params {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	return Params{
		Page:  page,
		Limit: limit,
		Skip:  (page - 1) * limit,
	}
}

func NewMeta(params Params, totalItems int64) Meta {
	totalPages := int(totalItems) / params.Limit
	if int(totalItems)%params.Limit > 0 {
		totalPages++
	}

	return Meta{
		CurrentPage: params.Page,
		PageSize:    params.Limit,
		TotalItems:  totalItems,
		TotalPages:  totalPages,
	}
}
