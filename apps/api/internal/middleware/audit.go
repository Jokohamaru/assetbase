package middleware

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"strings"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/prisma/db"
	"github.com/gin-gonic/gin"
)

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func Audit() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only log mutating requests
		if c.Request.Method == http.MethodGet || c.Request.Method == http.MethodOptions {
			c.Next()
			return
		}

		// Skip login endpoint from recording body
		if strings.HasSuffix(c.Request.URL.Path, "/login") {
			c.Next()
			return
		}

		// Read request body
		var reqBody []byte
		if c.Request.Body != nil {
			reqBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(reqBody))
		}

		blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = blw

		c.Next()

		userID, exists := c.Get("userID")
		var actorID *string
		if exists {
			uid := userID.(string)
			actorID = &uid
		}

		action := c.Request.Method + " " + c.Request.URL.Path
		entityType := "HTTP_REQUEST"
		status := blw.Status()
		
		statusStr := "SUCCESS"
		if status >= 400 {
			statusStr = "FAILURE"
		}

		reqBodyStr := string(reqBody)
		if len(reqBodyStr) > 500 {
			reqBodyStr = reqBodyStr[:500] + "... (truncated)"
		}

		details := string(blw.body.Bytes())
		if len(details) > 500 {
			details = details[:500] + "... (truncated)"
		}
		
		// Create Audit Log asynchronously or directly
		// Note: error ignoring is fine here to not interrupt response
		if actorID != nil {
			database.Client.AuditLog.CreateOne(
				db.AuditLog.Action.Set(action),
				db.AuditLog.EntityType.Set(entityType),
				db.AuditLog.EntityID.Set("N/A"),
				db.AuditLog.Status.Set(statusStr),
				db.AuditLog.User.Link(db.User.ID.Equals(*actorID)),
				db.AuditLog.Details.Set("Request: " + reqBodyStr + " | Response: " + details),
				db.AuditLog.IpAddress.Set(c.ClientIP()),
			).Exec(context.Background())
		}
	}
}
