package middleware

import (
	"errors"
	"log/slog"
	"net/http"
	"strings"
	"tradeOn/internal/delivery/http/response"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/domain/services"

	"github.com/gin-gonic/gin"
)

const (
	contextUserID = "userID"
	contextRole   = "role"
)

type AuthMiddleware struct {
	jwtService services.JwtService
	logger     *slog.Logger
}

func NewAuthMiddleware(jwtService services.JwtService, logger *slog.Logger) *AuthMiddleware {
	return &AuthMiddleware{jwtService: jwtService, logger: logger}
}

func (m *AuthMiddleware) AuthRequire() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenStr string
		authHeader := c.GetHeader("Authorization")
		authQuery := c.Query("token")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				response.HandleDomainError(c, errs.ErrUnauthorized)
				c.Abort()
				return
			}
			tokenStr = parts[1]
		} else if authQuery != "" {
			tokenStr = authQuery
		} else {
			response.HandleDomainError(c, errs.ErrUnauthorized)
			c.Abort()
			return
		}
		claims, err := m.jwtService.ValidateAccessToken(c.Request.Context(), tokenStr)
		if err != nil {
			writeAuthError(c, err)
			c.Abort()
			return
		}

		if claims == nil || claims.UserID == "" {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid token")
			c.Abort()
			return
		}

		c.Set(contextUserID, claims.UserID)
		c.Set(contextRole, string(claims.Role))
		c.Next()
	}
}
func (m *AuthMiddleware) RequireRole(requiredRoles ...models.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.GetString(contextRole)
		userID := c.GetString(contextUserID)
		if role == "" {
			m.logger.Warn("role check failed: missing role",
				"method", c.Request.Method,
				"path", c.Request.URL.Path,
				"user_id", userID,
				"user_role", role,
				"ip", c.ClientIP(),
			)
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid token")
			c.Abort()
			return
		}
		if len(requiredRoles) == 0 {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid token")
			c.Abort()
			return
		}
		for _, r := range requiredRoles {
			requiredRoleStr := string(r)
			if requiredRoleStr == role {
				m.logger.Debug("role check passed",
					"method", c.Request.Method,
					"path", c.Request.URL.Path,
					"user_id", userID,
					"user_role", role,
					"required_roles", rolesToStrings(requiredRoles),
				)
				c.Next()
				return
			}
		}
		m.logger.Warn("role check failed: forbidden",
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"user_id", userID,
			"user_role", role,
			"required_roles", rolesToStrings(requiredRoles),
			"ip", c.ClientIP(),
		)
		response.HandleDomainError(c, errs.ErrForbidden)
		c.Abort()
		return
	}
}

func GetUserIDFromContext(c *gin.Context) string {
	userId := c.GetString(contextUserID)
	if userId == "" {
		return ""
	}
	return userId
}
func GetUserRoleFromContext(c *gin.Context) string {
	userRole := c.GetString(contextRole)
	if userRole == "" {
		return ""
	}
	return userRole
}
func GetUserClaimsFromContext(c *gin.Context) (*models.TokenClaims, error) {
	userRole := c.GetString(contextRole)
	userID := c.GetString(contextUserID)
	if userRole == "" || userID == "" {
		return nil, errs.ErrUnauthorized
	}
	return &models.TokenClaims{
		Role:   models.Role(userRole),
		UserID: userID,
	}, nil
}

func extractBearerToken(header string) string {
	header = strings.TrimSpace(header)
	if header == "" {
		return ""
	}

	parts := strings.Fields(header)
	if len(parts) != 2 {
		return ""
	}

	if !strings.EqualFold(parts[0], "Bearer") {
		return ""
	}

	return strings.TrimSpace(parts[1])
}

func writeAuthError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, errs.ErrUnauthorized):
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized")

	case errors.Is(err, errs.ErrForbidden):
		response.Error(c, http.StatusForbidden, "FORBIDDEN", "Forbidden")

	default:
		response.Error(c, http.StatusUnauthorized, "INVALID_TOKEN", "Invalid or expired token")
	}
}
func rolesToStrings(roles []models.Role) []string {
	result := make([]string, 0, len(roles))

	for _, role := range roles {
		result = append(result, string(role))
	}

	return result
}
