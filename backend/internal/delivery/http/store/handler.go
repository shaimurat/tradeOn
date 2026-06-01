package store

import (
	"tradeOn/internal/delivery/http/middleware"
	"tradeOn/internal/delivery/http/response"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/usecase/store_uc"

	"github.com/gin-gonic/gin"
)

type StoreHandler struct {
	storeUseCase *store_uc.StoreUseCase
}

func NewStoreHandler(storeUseCase *store_uc.StoreUseCase) *StoreHandler {
	return &StoreHandler{storeUseCase: storeUseCase}
}

// SellerCreate godoc
// @Summary Create seller store
// @Description Creates a new store for the authenticated seller
// @Tags Stores
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body SellerCreateStoreRequest true "Seller create store request"
// @Success 200 {object} StoreResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /stores/seller [post]
func (h *StoreHandler) SellerCreate(c *gin.Context) { // Handler for seller to create store
	var req SellerCreateStoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrJsonBindResponse(c, err, req)
		return
	}
	userID := middleware.GetUserIDFromContext(c)
	if userID == "" {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}
	store, err := h.storeUseCase.Create(c.Request.Context(), sellerCreateStoreRequestToStore(req, userID))
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	storeDto := ToStoreDTO(*store)
	c.JSON(200, StoreResponse{Store: storeDto})
}

// SellerUpdate godoc
// @Summary Update seller store
// @Description Updates a store owned by the authenticated seller
// @Tags Stores
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Store ID"
// @Param request body SellerPatchStoreRequest true "Seller patch store request"
// @Success 200 {object} StoreResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /stores/seller/{id} [patch]
func (h *StoreHandler) SellerUpdate(c *gin.Context) { // Handler for seller to update store
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{"id": "id is required"})
		return
	}
	var req SellerPatchStoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrJsonBindResponse(c, err, req)
		return
	}
	userClaims, err := middleware.GetUserClaimsFromContext(c)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	store, err := h.storeUseCase.Update(c.Request.Context(), id, userClaims.UserID, userClaims.Role, sellerPatchStoreRequestToPatchStoreParams(req))
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	storeDto := ToStoreDTO(*store)
	c.JSON(200, StoreResponse{Store: storeDto})
}

// Delete godoc
// @Summary Delete store
// @Description Deletes a store. Seller can delete only own store, admin can delete any store
// @Tags Stores
// @Produce json
// @Security BearerAuth
// @Param id path string true "Store ID"
// @Success 204
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /stores/seller/{id} [delete]
// @Router /stores/admin/{id} [delete]
func (h *StoreHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{"id": "id is required"})
		return
	}
	userClaims, err := middleware.GetUserClaimsFromContext(c)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	err = h.storeUseCase.Delete(c.Request.Context(), id, userClaims.UserID, userClaims.Role)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	c.Status(204)
}

// ListSellerStores godoc
// @Summary List seller stores
// @Description Returns stores that belong to the authenticated seller
// @Tags Stores
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param search query string false "Search by store name, slug, description or other searchable fields"
// @Param status query models.StoreStatus false "Store status"
// @Param offset query int false "Pagination offset"
// @Param limit query int false "Pagination limit"
// @Param sort_by query models.StoreSortBy false "Sort field"
// @Param sort_order query models.SortOrder false "Sort order"
// @Success 200 {object} ListStoreResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /stores/seller [get]
func (h *StoreHandler) ListSellerStores(c *gin.Context) { // Returns stores that belong to seller
	var params ListStoreParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.HandleDomainError(c, errs.ErrInvalidInput)
		return
	}
	userID := middleware.GetUserIDFromContext(c)
	if userID == "" {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}
	params.SellerID = &userID
	stores, count, err := h.storeUseCase.GetList(c.Request.Context(), listStoreRequestToParams(params))
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	storeDtos := ToStoreDTOs(stores)
	c.JSON(200, ListStoreResponse{Stores: storeDtos, Count: count})
}

// ListStoresGlobal godoc
// @Summary List stores
// @Description Returns public/global list of stores with optional filters
// @Tags Stores
// @Accept json
// @Produce json
// @Param search query string false "Search by store name, slug, description or other searchable fields"
// @Param seller_id query string false "Seller ID"
// @Param status query models.StoreStatus false "Store status"
// @Param offset query int false "Pagination offset"
// @Param limit query int false "Pagination limit"
// @Param sort_by query models.StoreSortBy false "Sort field"
// @Param sort_order query models.SortOrder false "Sort order"
// @Success 200 {object} ListStoreResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /stores [get]
func (h *StoreHandler) ListStoresGlobal(c *gin.Context) { // Global search which shows all stores
	var params ListStoreParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.HandleDomainError(c, errs.ErrInvalidInput)
		return
	}
	stores, count, err := h.storeUseCase.GetList(c.Request.Context(), listStoreRequestToParams(params))
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	storeDtos := ToStoreDTOs(stores)
	c.JSON(200, ListStoreResponse{Stores: storeDtos, Count: count})
}

// GetStoreByID godoc
// @Summary Get store by ID
// @Description Returns store by store ID
// @Tags Stores
// @Accept json
// @Produce json
// @Param id path string true "Store ID"
// @Success 200 {object} StoreResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /stores/{id} [get]
func (h *StoreHandler) GetStoreByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{"id": "id is required"})
		return
	}
	store, err := h.storeUseCase.GetByID(c.Request.Context(), id)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	storeDto := ToStoreDTO(*store)
	c.JSON(200, StoreResponse{Store: storeDto})
}

// GetStoreBySlug godoc
// @Summary Get store by slug
// @Description Returns store by unique store slug
// @Tags Stores
// @Accept json
// @Produce json
// @Param slug path string true "Store slug"
// @Success 200 {object} StoreResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /stores/slug/{slug} [get]
func (h *StoreHandler) GetStoreBySlug(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		response.ValidationError(c, map[string]string{"slug": "slug is required"})
		return
	}
	store, err := h.storeUseCase.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	storeDto := ToStoreDTO(*store)
	c.JSON(200, StoreResponse{Store: storeDto})
}

// AdminCreate godoc
// @Summary Create store as admin
// @Description Creates a new store for a selected seller. Admin only
// @Tags Stores
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body AdminCreateStoreRequest true "Admin create store request"
// @Success 200 {object} StoreResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /stores/admin [post]
func (h *StoreHandler) AdminCreate(c *gin.Context) { // handler for admin to create store
	var req AdminCreateStoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrJsonBindResponse(c, err, req)
		return
	}
	store, err := h.storeUseCase.Create(c.Request.Context(), adminCreateStoreRequestToStore(req))
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	storeDto := ToStoreDTO(*store)
	c.JSON(200, StoreResponse{Store: storeDto})
}

// AdminUpdate godoc
// @Summary Update store as admin
// @Description Updates any store as admin
// @Tags Stores
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Store ID"
// @Param request body AdminPatchStoreRequest true "Admin patch store request"
// @Success 200 {object} StoreResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /stores/admin/{id} [patch]
func (h *StoreHandler) AdminUpdate(c *gin.Context) { // handler for admin to update store
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{"id": "id is required"})
		return
	}
	var req AdminPatchStoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrJsonBindResponse(c, err, req)
		return
	}
	userClaims, err := middleware.GetUserClaimsFromContext(c)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	store, err := h.storeUseCase.Update(c.Request.Context(), id, userClaims.UserID, userClaims.Role, adminPatchStoreRequestToPatchStoreParams(req))
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	storeDto := ToStoreDTO(*store)
	c.JSON(200, StoreResponse{Store: storeDto})
}
