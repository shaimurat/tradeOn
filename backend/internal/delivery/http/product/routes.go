package product

import (
	"tradeOn/internal/delivery/http/middleware"
	"tradeOn/internal/domain/models"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(
	api *gin.RouterGroup,
	productHandler *ProductHandler,
	productCategoryHandler *ProductCategoryHandler,
	middleware *middleware.AuthMiddleware,
) {
	products := api.Group("/products")

	// Public routes
	products.GET("", productHandler.ListProducts)
	products.GET("/:id", productHandler.GetByID)
	products.GET("/store/:store_id/slug/:slug", productHandler.GetBySlug)

	// Seller routes
	sellerProducts := products
	sellerProducts.Use(middleware.AuthRequire())
	sellerProducts.Use(middleware.RequireRole(models.RoleSeller))
	{
		sellerProducts.POST("/", productHandler.Create)
		sellerProducts.PATCH("/:id", productHandler.Update)
		sellerProducts.DELETE("/:id", productHandler.Delete)
	}

	productCategories := api.Group("/product-categories")

	// Public category routes
	productCategories.GET("", productCategoryHandler.List)
	productCategories.GET("/:id", productCategoryHandler.GetByID)

	// Protected category routes
	protectedCategories := api.Group("/product-categories")
	protectedCategories.Use(middleware.AuthRequire())
	protectedCategories.Use(middleware.RequireRole(models.RoleAdmin, models.RoleSeller))
	{
		protectedCategories.POST("", productCategoryHandler.Create)
		protectedCategories.PATCH("/:id", productCategoryHandler.Update)
		protectedCategories.DELETE("/:id", productCategoryHandler.Delete)
	}

}
