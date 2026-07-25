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
	productAttributeHandler *ProductAttributeHandler,
	middleware *middleware.AuthMiddleware,
) {
	products := api.Group("/products")

	// Public routes
	products.GET("", productHandler.ListProducts)
	products.GET("/:id", productHandler.GetByID)
	products.GET("/store/:store_id/slug/:slug", productHandler.GetBySlug)

	// Admin and seller routes
	sellerProducts := products
	sellerProducts.Use(middleware.AuthRequire())
	sellerProducts.Use(middleware.RequireRole(models.RoleAdmin, models.RoleSeller))
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

	productAttributes := api.Group("/product-attributes")
	productAttributes.GET("", productAttributeHandler.List)
	productAttributes.GET("/:id", productAttributeHandler.GetByID)
	productAttributes.GET("/:id/options", productAttributeHandler.ListOptions)

	protectedAttributes := api.Group("/product-attributes")
	protectedAttributes.Use(middleware.AuthRequire())
	protectedAttributes.Use(middleware.RequireRole(models.RoleAdmin, models.RoleSeller))
	{
		protectedAttributes.POST("", productAttributeHandler.Create)
		protectedAttributes.PATCH("/:id", productAttributeHandler.Update)
		protectedAttributes.DELETE("/:id", productAttributeHandler.Delete)
		protectedAttributes.POST("/:id/options", productAttributeHandler.CreateOption)
		protectedAttributes.PATCH("/:id/options/:option_id", productAttributeHandler.UpdateOption)
		protectedAttributes.DELETE("/:id/options/:option_id", productAttributeHandler.DeleteOption)
	}

	productValues := api.Group("/products")
	productValues.Use(middleware.AuthRequire())
	productValues.Use(middleware.RequireRole(models.RoleAdmin, models.RoleSeller))
	{
		productValues.POST("/:id/attributes", productAttributeHandler.CreateValue)
		productValues.PATCH("/:id/attributes/:value_id", productAttributeHandler.UpdateValue)
		productValues.DELETE("/:id/attributes/:value_id", productAttributeHandler.DeleteValue)
	}

}
