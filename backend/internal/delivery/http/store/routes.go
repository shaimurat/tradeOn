package store

import (
	"tradeOn/internal/delivery/http/middleware"
	"tradeOn/internal/domain/models"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(
	api *gin.RouterGroup,
	storeHandler *StoreHandler,
	middleware *middleware.AuthMiddleware,
) {
	stores := api.Group("/stores")

	stores.GET("", storeHandler.ListStoresGlobal)
	stores.GET("/slug/:slug", storeHandler.GetStoreBySlug)
	stores.GET("/:id", storeHandler.GetStoreByID)

	sellerStores := stores.Group("/seller")
	sellerStores.Use(middleware.AuthRequire())
	sellerStores.Use(middleware.RequireRole(models.RoleSeller))
	{
		sellerStores.POST("", storeHandler.SellerCreate)
		sellerStores.GET("", storeHandler.ListSellerStores)
		sellerStores.PATCH("/:id", storeHandler.SellerUpdate)
		sellerStores.DELETE("/:id", storeHandler.Delete)
	}

	// Admin routes
	adminStores := stores.Group("/admin")
	adminStores.Use(middleware.AuthRequire())
	adminStores.Use(middleware.RequireRole(models.RoleAdmin))
	{
		adminStores.POST("", storeHandler.AdminCreate)
		adminStores.PATCH("/:id", storeHandler.AdminUpdate)
		adminStores.DELETE("/:id", storeHandler.Delete)
	}
}
