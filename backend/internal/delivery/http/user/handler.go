package user

import (
	"net/http"
	"tradeOn/internal/delivery/http/response"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/usecase/user_uc"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userUseCase *user_uc.UserUseCase
}

func NewUserHandler(userUseCase *user_uc.UserUseCase) *UserHandler {
	return &UserHandler{userUseCase: userUseCase}
}

// Create godoc
// @Summary Create user
// @Description Creates a new user
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateUserRequest true "Create user request"
// @Success 200 {object} UserResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users [post]
func (h *UserHandler) Create(c *gin.Context) {
	var req CreateUserRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.ErrJsonBindResponse(c, err, req)
		return
	}
	user := createUserRequestToUser(req)

	createdUser, err := h.userUseCase.Create(c.Request.Context(), user)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	userDto := ToUserDTO(*createdUser)
	c.JSON(200, UserResponse{User: userDto})
}

// Update godoc
// @Summary Update user
// @Description Updates user fields by user ID
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param request body PatchUserRequest true "Patch user request"
// @Success 200 {object} UserResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/{id} [patch]
func (h *UserHandler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{"id": "id is required"})
		return
	}
	var req PatchUserRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		response.ErrJsonBindResponse(c, err, req)
		return
	}
	params := requestToPatchUserParams(req)
	user, err := h.userUseCase.Update(c.Request.Context(), id, params)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	userDto := ToUserDTO(*user)
	c.JSON(200, UserResponse{User: userDto})
}

// Delete godoc
// @Summary Delete user
// @Description Deletes user by user ID
// @Tags Users
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 204 "No Content"
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/{id} [delete]
func (h *UserHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{"id": "id is required"})
		return
	}
	err := h.userUseCase.Delete(c.Request.Context(), id)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// ListUsers godoc
// @Summary List users
// @Description Returns a list of users with optional filters by role, status, and search query
// @Tags Users
// @Produce json
// @Security BearerAuth
// @Param role query models.Role false "User role"
// @Param status query models.UserStatus false "User status"
// @Param search query string false "Search by username, email, or other searchable fields"
// @Success 200 {object} ListUserResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users [get]
func (h *UserHandler) ListUsers(c *gin.Context) {
	var query ListUserRequest
	err := c.ShouldBindQuery(&query)
	if err != nil {
		response.HandleDomainError(c, errs.ErrInvalidInput)
		return
	}
	users, err := h.userUseCase.GetList(c.Request.Context(), models.ListUserParams{
		Role:   query.Role,
		Status: query.Status,
		Search: query.Search,
	})
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	usersDto := ToUserDTOs(users)
	c.JSON(200, ListUserResponse{
		Users: usersDto,
		Count: len(usersDto),
	})
}

// GetUser godoc
// @Summary GetByID user
// @Description Returns user by user ID
// @Tags Users
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 200 {object} UserResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.ValidationError(c, map[string]string{"id": "id is required"})
		return
	}
	user, err := h.userUseCase.Get(c.Request.Context(), id)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	userDto := ToUserDTO(*user)
	c.JSON(200, UserResponse{User: userDto})
}
