package response

import (
	"github.com/gin-gonic/gin"
)

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorDetail `json:"error,omitempty"`
	Meta    interface{} `json:"meta,omitempty"`
}

type ErrorDetail struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(200, Response{
		Success: true,
		Data:    data,
	})
}

func SuccessList(c *gin.Context, data interface{}, meta interface{}) {
	c.JSON(200, Response{
		Success: true,
		Data:    data,
		Meta:    meta,
	})
}

func Error(c *gin.Context, code int, message string) {
	c.JSON(code, Response{
		Success: false,
		Error: &ErrorDetail{
			Code:    code,
			Message: message,
		},
	})
}
