package product

import (
	"tradeOn/internal/delivery/http/middleware"
	"tradeOn/internal/delivery/http/response"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/usecase/product_uc"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	productUseCase *product_uc.ProductUseCase
}

func NewProductHandler(productUseCase *product_uc.ProductUseCase) *ProductHandler {
	return &ProductHandler{productUseCase: productUseCase}
}

// Create godoc
// @Summary Create product
// @Description Creates a new product for the authenticated seller
// @Tags Products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateProductRequest true "Create product request"
// @Success 201 {object} ProductResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /products [post]
func (h *ProductHandler) Create(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrJsonBindResponse(c, err, req)
		return
	}
	userClaims, err := middleware.GetUserClaimsFromContext(c)
	if err != nil {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}
	input := CreateProductRequestToInput(req)
	product, err := h.productUseCase.Create(c.Request.Context(), input, userClaims.UserID, userClaims.Role)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	productDto := ToProductDTO(*product)
	c.JSON(201, ProductResponse{productDto})
}

// Update godoc
// @Summary Update product
// @Description Updates a product. Seller can update only products from own store, admin can update any product
// @Tags Products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Param request body PatchProductRequest true "Patch product request"
// @Success 200 {object} ProductResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /products/{id} [patch]
func (h *ProductHandler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{"id": "id is required"})
		return
	}
	var req PatchProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrJsonBindResponse(c, err, req)
		return
	}
	userClaims, err := middleware.GetUserClaimsFromContext(c)
	if err != nil {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}
	input := PatchProductRequestToParams(req)
	product, err := h.productUseCase.Update(c.Request.Context(), id, userClaims.UserID, userClaims.Role, input)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	productDto := ToProductDTO(*product)
	c.JSON(200, ProductResponse{productDto})
}

// Delete godoc
// @Summary Delete product
// @Description Deletes a product. Seller can delete only products from own store, admin can delete any product
// @Tags Products
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Success 204
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /products/{id} [delete]
func (h *ProductHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{"id": "id is required"})
		return
	}
	userClaims, err := middleware.GetUserClaimsFromContext(c)
	if err != nil {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}
	err = h.productUseCase.Delete(c.Request.Context(), id, userClaims.UserID, userClaims.Role)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	c.Status(204)
}

// GetByID godoc
// @Summary Get product by ID
// @Description Returns product by product ID
// @Tags Products
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} ProductResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /products/{id} [get]
func (h *ProductHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{"id": "id is required"})
		return
	}
	product, err := h.productUseCase.GetByID(c.Request.Context(), id)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	productDto := ToProductDTO(*product)
	c.JSON(200, ProductResponse{productDto})
}

// GetBySlug godoc
// @Summary Get product by slug
// @Description Returns product by store ID and product slug
// @Tags Products
// @Accept json
// @Produce json
// @Param store_id path string true "Store ID"
// @Param slug path string true "Product slug"
// @Success 200 {object} ProductResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /products/store/{store_id}/slug/{slug} [get]
func (h *ProductHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	storeID := c.Param("store_id")
	if slug == "" {
		response.ValidationError(c, map[string]string{"slug": "slug is required"})
		return
	}
	if storeID == "" {
		response.ValidationError(c, map[string]string{"store_id": "store_id is required"})
		return
	}
	product, err := h.productUseCase.GetBySlug(c.Request.Context(), storeID, slug)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	productDto := ToProductDTO(*product)
	c.JSON(200, ProductResponse{productDto})
}

// ListProducts godoc
// @Summary List products
// @Description Returns public/global list of products with optional filters
// @Tags Products
// @Accept json
// @Produce json
// @Param store_id query string false "Store ID"
// @Param search query string false "Search by product name, slug, description or SKU"
// @Param category_id query string false "Category ID"
// @Param price_from query int false "Minimum price"
// @Param price_to query int false "Maximum price"
// @Param status query models.ProductStatus false "Product status"
// @Param offset query int false "Pagination offset"
// @Param limit query int false "Pagination limit"
// @Param sort_by query string false "Sort field"
// @Param sort_order query models.SortOrder false "Sort order"
// @Success 200 {object} ProductsListResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /products [get]
func (h *ProductHandler) ListProducts(c *gin.Context) {
	var req ListProductsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.HandleDomainError(c, err)
		return
	}
	params := ListProductsRequestToParams(req)
	products, err := h.productUseCase.GetList(c.Request.Context(), params)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	productsDto := ToProductDTOs(products)

	c.JSON(200, ProductsListResponse{Products: productsDto, Count: len(products)})
}
