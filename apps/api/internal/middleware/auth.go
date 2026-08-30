package middleware

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/Jokohamaru/assetbase/internal/database"
	"github.com/Jokohamaru/assetbase/pkg/response"
	"github.com/Jokohamaru/assetbase/prisma/db"
	"github.com/gin-gonic/gin"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie("assetbase_session")
		if err != nil {
			response.Error(c, http.StatusUnauthorized, "Unauthorized: missing session")
			c.Abort()
			return
		}

		hash := sha256.Sum256([]byte(cookie))
		hashStr := hex.EncodeToString(hash[:])

		session, err := database.Client.AuthSession.FindUnique(
			db.AuthSession.TokenHash.Equals(hashStr),
		).With(
			db.AuthSession.User.Fetch(),
		).Exec(context.Background())

		if err != nil || session == nil {
			response.Error(c, http.StatusUnauthorized, "Unauthorized: invalid session")
			c.Abort()
			return
		}

		_, isRevoked := session.RevokedAt()
		if session.ExpiresAt.Before(time.Now()) || isRevoked {
			response.Error(c, http.StatusUnauthorized, "Unauthorized: session expired or revoked")
			c.Abort()
			return
		}

		c.Set("userID", session.User().ID)
		c.Set("userRole", string(session.User().Role))
		c.Next()
	}
}

func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists || userRole.(string) != role {
			response.Error(c, http.StatusForbidden, "Forbidden: insufficient permissions")
			c.Abort()
			return
		}
		c.Next()
	}
}
