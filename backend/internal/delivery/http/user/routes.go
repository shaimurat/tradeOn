package user

import (
	"tradeOn/internal/delivery/http/middleware"
	"tradeOn/internal/domain/models"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.RouterGroup, userHandler *UserHandler, middleware *middleware.AuthMiddleware) {
	users := r.Group("/users")
	users.Use(middleware.AuthRequire())
	{
		users.POST("", middleware.RequireRole(models.RoleAdmin), userHandler.Create)
		users.GET("", middleware.RequireRole(models.RoleAdmin), userHandler.ListUsers)
		users.GET("/:id", userHandler.GetUser)
		users.PATCH("/:id", userHandler.Update)
		users.DELETE("/:id", middleware.RequireRole(models.RoleAdmin), userHandler.Delete)
	}
}
