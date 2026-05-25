package auth

import (
	"tradeOn/internal/delivery/http/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.RouterGroup, authHandler *AuthHandler, middleware *middleware.AuthMiddleware) {
	auth := r.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.Refresh)
		auth.POST("/logout", authHandler.Logout)

		auth.GET("/me", middleware.AuthRequire(), authHandler.Me)
	}
}
