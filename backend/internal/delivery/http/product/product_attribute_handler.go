package product

import (
	"net/http"

	"tradeOn/internal/delivery/http/middleware"
	"tradeOn/internal/delivery/http/response"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/usecase/product_attribute_uc"

	"github.com/gin-gonic/gin"
)

type ProductAttributeHandler struct {
	useCase *product_attribute_uc.ProductAttributeUseCase
}

func NewProductAttributeHandler(useCase *product_attribute_uc.ProductAttributeUseCase) *ProductAttributeHandler {
	return &ProductAttributeHandler{useCase: useCase}
}

// Create godoc
// @Summary Create product attribute
// @Description Creates a product attribute for a store. Seller can create attributes only for own stores, admin can create for any store
// @Tags Product Attributes
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateProductAttributeRequest true "Create product attribute request"
// @Success 201 {object} ProductAttributeResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-attributes [post]
func (h *ProductAttributeHandler) Create(c *gin.Context) {
	var req CreateProductAttributeRequest
	if !bindJSON(c, &req) {
		return
	}
	claims, ok := getClaims(c)
	if !ok {
		return
	}
	attribute, err := h.useCase.Create(c.Request.Context(), models.ProductAttribute{
		StoreID: req.StoreID, CategoryID: req.CategoryID, Name: req.Name, Code: req.Code,
		IsRequired: req.IsRequired, IsFilter: req.IsFilter, Type: req.Type, Unit: req.Unit,
	}, claims.UserID, claims.Role)
	if handleError(c, err) {
		return
	}
	c.JSON(http.StatusCreated, ProductAttributeResponse{ProductAttribute: toProductAttributeDTO(*attribute)})
}

// Update godoc
// @Summary Update product attribute
// @Description Updates a product attribute. Seller can update attributes only for own stores, admin can update any attribute
// @Tags Product Attributes
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product attribute ID"
// @Param request body PatchProductAttributeRequest true "Patch product attribute request"
// @Success 200 {object} ProductAttributeResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-attributes/{id} [patch]
func (h *ProductAttributeHandler) Update(c *gin.Context) {
	var req PatchProductAttributeRequest
	if !bindJSON(c, &req) {
		return
	}
	claims, ok := getClaims(c)
	if !ok {
		return
	}
	attribute, err := h.useCase.Update(c.Request.Context(), c.Param("id"), models.PatchProductAttributeParams{
		Name: req.Name, Code: req.Code, IsRequired: req.IsRequired, IsFilter: req.IsFilter, Type: req.Type, Unit: req.Unit,
	}, claims.UserID, claims.Role)
	if handleError(c, err) {
		return
	}
	c.JSON(http.StatusOK, ProductAttributeResponse{ProductAttribute: toProductAttributeDTO(*attribute)})
}

// Delete godoc
// @Summary Delete product attribute
// @Description Deletes a product attribute and its options and product values
// @Tags Product Attributes
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product attribute ID"
// @Success 204 "No Content"
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-attributes/{id} [delete]
func (h *ProductAttributeHandler) Delete(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		return
	}
	if handleError(c, h.useCase.Delete(c.Request.Context(), c.Param("id"), claims.UserID, claims.Role)) {
		return
	}
	c.Status(http.StatusNoContent)
}

// GetByID godoc
// @Summary Get product attribute by ID
// @Description Returns a product attribute by ID
// @Tags Product Attributes
// @Produce json
// @Param id path string true "Product attribute ID"
// @Success 200 {object} ProductAttributeResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-attributes/{id} [get]
func (h *ProductAttributeHandler) GetByID(c *gin.Context) {
	attribute, err := h.useCase.GetByID(c.Request.Context(), c.Param("id"))
	if handleError(c, err) {
		return
	}
	c.JSON(http.StatusOK, ProductAttributeResponse{ProductAttribute: toProductAttributeDTO(*attribute)})
}

// List godoc
// @Summary List product attributes
// @Description Returns all product attributes for a store
// @Tags Product Attributes
// @Produce json
// @Param store_id query string true "Store ID"
// @Success 200 {object} ProductAttributesResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-attributes [get]
func (h *ProductAttributeHandler) List(c *gin.Context) {
	storeID := c.Query("store_id")
	if storeID == "" {
		response.ValidationError(c, map[string]string{"store_id": "store_id is required"})
		return
	}
	attributes, err := h.useCase.ListByStoreID(c.Request.Context(), storeID)
	if handleError(c, err) {
		return
	}
	items := make([]ProductAttributeDTO, 0, len(attributes))
	for _, attribute := range attributes {
		items = append(items, toProductAttributeDTO(*attribute))
	}
	c.JSON(http.StatusOK, ProductAttributesResponse{ProductAttributes: items, Count: len(items)})
}

// CreateOption godoc
// @Summary Create product attribute option
// @Description Creates an option for a select product attribute
// @Tags Product Attribute Options
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product attribute ID"
// @Param request body CreateProductAttributeOptionRequest true "Create product attribute option request"
// @Success 201 {object} ProductAttributeOptionResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-attributes/{id}/options [post]
func (h *ProductAttributeHandler) CreateOption(c *gin.Context) {
	var req CreateProductAttributeOptionRequest
	if !bindJSON(c, &req) {
		return
	}
	claims, ok := getClaims(c)
	if !ok {
		return
	}
	option, err := h.useCase.CreateOption(c.Request.Context(), models.ProductAttributeOption{
		ProductAttributeID: c.Param("id"), Value: req.Value, Position: req.Position,
	}, claims.UserID, claims.Role)
	if handleError(c, err) {
		return
	}
	c.JSON(http.StatusCreated, ProductAttributeOptionResponse{ProductAttributeOption: toProductAttributeOptionDTO(*option)})
}

// UpdateOption godoc
// @Summary Update product attribute option
// @Description Updates an option of a select product attribute
// @Tags Product Attribute Options
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product attribute ID"
// @Param option_id path string true "Product attribute option ID"
// @Param request body PatchProductAttributeOptionRequest true "Patch product attribute option request"
// @Success 200 {object} ProductAttributeOptionResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-attributes/{id}/options/{option_id} [patch]
func (h *ProductAttributeHandler) UpdateOption(c *gin.Context) {
	var req PatchProductAttributeOptionRequest
	if !bindJSON(c, &req) {
		return
	}
	claims, ok := getClaims(c)
	if !ok {
		return
	}
	option, err := h.useCase.UpdateOption(c.Request.Context(), c.Param("option_id"), models.PatchProductAttributeOptionParams{
		Value: req.Value, Position: req.Position,
	}, claims.UserID, claims.Role)
	if handleError(c, err) {
		return
	}
	c.JSON(http.StatusOK, ProductAttributeOptionResponse{ProductAttributeOption: toProductAttributeOptionDTO(*option)})
}

// DeleteOption godoc
// @Summary Delete product attribute option
// @Description Deletes an option from a select product attribute
// @Tags Product Attribute Options
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product attribute ID"
// @Param option_id path string true "Product attribute option ID"
// @Success 204 "No Content"
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-attributes/{id}/options/{option_id} [delete]
func (h *ProductAttributeHandler) DeleteOption(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		return
	}
	if handleError(c, h.useCase.DeleteOption(c.Request.Context(), c.Param("option_id"), claims.UserID, claims.Role)) {
		return
	}
	c.Status(http.StatusNoContent)
}

// ListOptions godoc
// @Summary List product attribute options
// @Description Returns all options of a product attribute ordered by position
// @Tags Product Attribute Options
// @Produce json
// @Param id path string true "Product attribute ID"
// @Success 200 {object} ProductAttributeOptionsResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /product-attributes/{id}/options [get]
func (h *ProductAttributeHandler) ListOptions(c *gin.Context) {
	options, err := h.useCase.ListOptions(c.Request.Context(), c.Param("id"))
	if handleError(c, err) {
		return
	}
	items := make([]ProductAttributeOptionDTO, 0, len(options))
	for _, option := range options {
		items = append(items, toProductAttributeOptionDTO(*option))
	}
	c.JSON(http.StatusOK, ProductAttributeOptionsResponse{ProductAttributeOptions: items, Count: len(items)})
}

// CreateValue godoc
// @Summary Add product attribute value
// @Description Adds an attribute value to a product. Exactly one value field matching the attribute type must be provided
// @Tags Product Attribute Values
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Param request body CreateProductAttributeValueRequest true "Create product attribute value request"
// @Success 201 {object} ProductAttributeValueResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /products/{id}/attributes [post]
func (h *ProductAttributeHandler) CreateValue(c *gin.Context) {
	var req CreateProductAttributeValueRequest
	if !bindJSON(c, &req) {
		return
	}
	claims, ok := getClaims(c)
	if !ok {
		return
	}
	value, err := h.useCase.CreateValue(c.Request.Context(), models.ProductAttributeValue{
		ProductID: c.Param("id"), ProductAttributeID: req.ProductAttributeID,
		ValueText: req.ValueText, ValueNumber: req.ValueNumber, ValueBool: req.ValueBool, OptionID: req.OptionID,
	}, claims.UserID, claims.Role)
	if handleError(c, err) {
		return
	}
	c.JSON(http.StatusCreated, ProductAttributeValueResponse{ProductAttributeValue: toProductAttributeValueDTO(*value)})
}

// UpdateValue godoc
// @Summary Update product attribute value
// @Description Updates an attribute value assigned to a product
// @Tags Product Attribute Values
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Param value_id path string true "Product attribute value ID"
// @Param request body PatchProductAttributeValueRequest true "Patch product attribute value request"
// @Success 200 {object} ProductAttributeValueResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /products/{id}/attributes/{value_id} [patch]
func (h *ProductAttributeHandler) UpdateValue(c *gin.Context) {
	var req PatchProductAttributeValueRequest
	if !bindJSON(c, &req) {
		return
	}
	claims, ok := getClaims(c)
	if !ok {
		return
	}
	value, err := h.useCase.UpdateValue(c.Request.Context(), c.Param("value_id"), models.PatchProductAttributeValueParams(req), claims.UserID, claims.Role)
	if handleError(c, err) {
		return
	}
	c.JSON(http.StatusOK, ProductAttributeValueResponse{ProductAttributeValue: toProductAttributeValueDTO(*value)})
}

// DeleteValue godoc
// @Summary Delete product attribute value
// @Description Deletes an attribute value assigned to a product
// @Tags Product Attribute Values
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Param value_id path string true "Product attribute value ID"
// @Success 204 "No Content"
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /products/{id}/attributes/{value_id} [delete]
func (h *ProductAttributeHandler) DeleteValue(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		return
	}
	if handleError(c, h.useCase.DeleteValue(c.Request.Context(), c.Param("value_id"), claims.UserID, claims.Role)) {
		return
	}
	c.Status(http.StatusNoContent)
}

func bindJSON(c *gin.Context, request any) bool {
	if err := c.ShouldBindJSON(request); err != nil {
		response.ErrJsonBindResponse(c, err, request)
		return false
	}
	return true
}

func getClaims(c *gin.Context) (*models.TokenClaims, bool) {
	claims, err := middleware.GetUserClaimsFromContext(c)
	if err != nil {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return nil, false
	}
	return claims, true
}

func handleError(c *gin.Context, err error) bool {
	if err == nil {
		return false
	}
	response.HandleDomainError(c, err)
	return true
}
