package product

import (
	"tradeOn/internal/delivery/http/middleware"
	"tradeOn/internal/delivery/http/response"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/usecase/product_category_uc"

	"github.com/gin-gonic/gin"
)

type ProductCategoryHandler struct {
	productCategoryUseCase *product_category_uc.ProductCategoryUseCase
}

func NewProductCategoryHandler(productCategoryUseCase *product_category_uc.ProductCategoryUseCase) *ProductCategoryHandler {
	return &ProductCategoryHandler{
		productCategoryUseCase: productCategoryUseCase,
	}
}

// Create godoc
// @Summary Create product category
// @Description Creates a new product category. Seller can create category only for own store, admin can create for any store
// @Tags Product Categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateProductCategoryRequest true "Create product category request"
// @Success 201 {object} ProductCategoryResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-categories [post]
func (h *ProductCategoryHandler) Create(c *gin.Context) {
	var req CreateProductCategoryRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrJsonBindResponse(c, err, req)
		return
	}

	userClaims, err := middleware.GetUserClaimsFromContext(c)
	if err != nil {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}

	category, err := h.productCategoryUseCase.Create(
		c.Request.Context(),
		ToProductCategoryFromCreateRequest(req),
		userClaims.UserID,
		userClaims.Role,
	)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}

	c.JSON(201, ProductCategoryResponse{
		ProductCategory: ToProductCategoryDTO(*category),
	})
}

// Update godoc
// @Summary Update product category
// @Description Updates product category. Seller can update only categories from own store, admin can update any category
// @Tags Product Categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product category ID"
// @Param request body PatchProductCategoryParams true "Patch product category request"
// @Success 200 {object} ProductCategoryResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-categories/{id} [patch]
func (h *ProductCategoryHandler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{
			"id": "id is required",
		})
		return
	}

	var req PatchProductCategoryParams
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrJsonBindResponse(c, err, req)
		return
	}

	userClaims, err := middleware.GetUserClaimsFromContext(c)
	if err != nil {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}

	category, err := h.productCategoryUseCase.Update(
		c.Request.Context(),
		id,
		ToProductCategoryPatchParams(req),
		userClaims.UserID,
		userClaims.Role,
	)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}

	c.JSON(200, ProductCategoryResponse{
		ProductCategory: ToProductCategoryDTO(*category),
	})
}

// Delete godoc
// @Summary Delete product category
// @Description Deletes product category. Seller can delete only categories from own store, admin can delete any category
// @Tags Product Categories
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product category ID"
// @Success 204
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-categories/{id} [delete]
func (h *ProductCategoryHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{
			"id": "id is required",
		})
		return
	}

	userClaims, err := middleware.GetUserClaimsFromContext(c)
	if err != nil {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}

	if err := h.productCategoryUseCase.Delete(
		c.Request.Context(),
		id,
		userClaims.UserID,
		userClaims.Role,
	); err != nil {
		response.HandleDomainError(c, err)
		return
	}

	c.Status(204)
}

// GetByID godoc
// @Summary Get product category by ID
// @Description Returns product category by ID
// @Tags Product Categories
// @Accept json
// @Produce json
// @Param id path string true "Product category ID"
// @Success 200 {object} ProductCategoryResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-categories/{id} [get]
func (h *ProductCategoryHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{
			"id": "id is required",
		})
		return
	}

	category, err := h.productCategoryUseCase.GetByID(c.Request.Context(), id)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}

	c.JSON(200, ProductCategoryResponse{
		ProductCategory: ToProductCategoryDTO(*category),
	})
}

// List godoc
// @Summary List product categories
// @Description Returns product categories with optional filters
// @Tags Product Categories
// @Accept json
// @Produce json
// @Param store_id query string false "Store ID"
// @Param search query string false "Search by category name or description"
// @Param parent_id query string false "Parent category ID"
// @Param only_root query bool false "Return only root categories"
// @Success 200 {object} ProductCategoriesListResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-categories [get]
func (h *ProductCategoryHandler) List(c *gin.Context) {
	var req ListProductCategoryParams

	if err := c.ShouldBindQuery(&req); err != nil {
		response.ErrJsonBindResponse(c, err, req)
		return
	}

	categories, err := h.productCategoryUseCase.List(
		c.Request.Context(),
		ToProductCategoryListParams(req),
	)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}

	c.JSON(200, ProductCategoriesListResponse{
		ProductCategories: ToProductCategoryDTOs(categories),
		Count:             len(categories),
	})
}
