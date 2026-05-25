package auth

import (
	"net/http"
	"strings"
	"time"
	"tradeOn/internal/config"
	"tradeOn/internal/delivery/http/middleware"
	"tradeOn/internal/delivery/http/response"
	"tradeOn/internal/delivery/http/user"
	"tradeOn/internal/domain/models/errs"
	"tradeOn/internal/shared/normalize"
	"tradeOn/internal/usecase/auth_uc"

	"github.com/gin-gonic/gin"
)

const refreshTokenCookie = "refresh_token"
const refreshTokenCookiePath = "/api/auth"

type AuthHandler struct {
	authUseCase *auth_uc.AuthUseCase
	cfg         *config.Config
}

func NewAuthHandler(authUseCase *auth_uc.AuthUseCase, cfg *config.Config) *AuthHandler {
	return &AuthHandler{authUseCase: authUseCase, cfg: cfg}
}

// Register godoc
// @Summary Register user
// @Description Creates a new user account and returns access and refresh tokens
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body RegisterRequest true "Register request"
// @Success 201 {object} AuthResult
// @Failure 400 {object} response.ErrorResponse
// @Failure 409 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.HandleDomainError(c, errs.ErrInvalidInput)
		return
	}
	input := registerReqToInput(req)
	validationErrs := make(map[string]string)
	if input.Email == "" {
		validationErrs["email"] = "email is required"
	}
	if input.Username == "" {
		validationErrs["username"] = "username is required"
	}
	if input.Password == "" {
		validationErrs["password"] = "password is required"
	}
	if len(input.Password) < 8 {
		validationErrs["password"] = "password must be at least 8 characters"
	}
	if len(validationErrs) > 0 {
		response.ValidationError(c, validationErrs)
		return
	}

	input.UserAgent = getUserAgent(c)
	input.IpAddress = getIPAddress(c)
	input.UserDevice = getUserDevice(c)
	res, err := h.authUseCase.Register(c.Request.Context(), input)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	setRefreshTokenInHttpCookie(c, res.RefreshToken, h.cfg)
	resDto := authResToDto(*res)
	c.JSON(http.StatusCreated, resDto)
}

// Login godoc
// @Summary Login user
// @Description Authenticates user by email and password and returns access and refresh tokens
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body loginRequest true "Login request"
// @Success 200 {object} AuthResult
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.HandleDomainError(c, errs.ErrInvalidInput)
		return
	}
	validationErrs := make(map[string]string)
	input := loginReqToInput(req)
	if input.Email == "" {
		validationErrs["email"] = "email is required"
	}
	if input.Password == "" {
		validationErrs["password"] = "password is required"
	}
	if len(validationErrs) > 0 {
		response.ValidationError(c, validationErrs)
		return
	}
	input.UserAgent = getUserAgent(c)
	input.IpAddress = getIPAddress(c)
	input.UserDevice = getUserDevice(c)
	res, err := h.authUseCase.Login(c.Request.Context(), input)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	setRefreshTokenInHttpCookie(c, res.RefreshToken, h.cfg)
	resDto := authResToDto(*res)
	c.JSON(http.StatusOK, resDto)
}

// Logout godoc
// @Summary Logout user
// @Description Invalidates the provided refresh token
// @Tags Auth
// @Accept json
// @Produce json
// @Success 204 "No Content"
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	refreshToken, err := c.Cookie(refreshTokenCookie)
	if err != nil {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}
	if refreshToken == "" {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}
	err = h.authUseCase.Logout(c.Request.Context(), auth_uc.LogoutInput{
		RefreshToken: normalize.String(refreshToken),
	})
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     refreshTokenCookie,
		Path:     refreshTokenCookiePath,
		Value:    "",
		HttpOnly: true,
		Expires:  time.Now().Add(-1 * time.Hour),
		MaxAge:   -1,
	})
	c.Status(http.StatusNoContent)
}

// Refresh godoc
// @Summary Refresh tokens
// @Description Generates a new access token and refresh token using a valid refresh token
// @Tags Auth
// @Accept json
// @Produce json
// @Success 200 {object} AuthResult
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /auth/refresh [post]
func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie(refreshTokenCookie)
	if err != nil {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}
	if refreshToken == "" {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}
	res, err := h.authUseCase.Refresh(c.Request.Context(), auth_uc.RefreshInput{
		RefreshToken: normalize.String(refreshToken),
		UserAgent:    getUserAgent(c),
		UserDevice:   getUserDevice(c),
		IpAddress:    getIPAddress(c),
	})
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	setRefreshTokenInHttpCookie(c, res.RefreshToken, h.cfg)
	resDto := authResToDto(*res)
	c.JSON(http.StatusOK, resDto)
}

// Me godoc
// @Summary GetByID current user
// @Description Returns the authenticated user's profile
// @Tags Auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} user.UserResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	userID := middleware.GetUserIDFromContext(c)
	if userID == "" {
		response.HandleDomainError(c, errs.ErrUnauthorized)
		return
	}
	res, err := h.authUseCase.Me(c.Request.Context(), userID)
	if err != nil {
		response.HandleDomainError(c, err)
		return
	}
	resDto := user.ToUserDTO(*res)
	c.JSON(http.StatusOK, user.UserResponse{User: resDto})
}

func getUserAgent(c *gin.Context) string {
	return c.GetHeader("User-Agent")
}

func getIPAddress(c *gin.Context) string {
	return c.ClientIP()
}

func getUserDevice(c *gin.Context) string {
	device := c.GetHeader("X-Device")

	if strings.TrimSpace(device) == "" {
		return "unknown"
	}

	return strings.TrimSpace(device)
}

func setRefreshTokenInHttpCookie(c *gin.Context, refreshToken string, cfg *config.Config) {
	now := time.Now()
	refreshExp := now.Add(time.Hour * time.Duration(cfg.JWTConfig.JwtRefreshExpiresHours))
	maxAgeSeconds := int(time.Until(refreshExp).Seconds())

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     refreshTokenCookie,
		Path:     refreshTokenCookiePath,
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		MaxAge:   maxAgeSeconds,
	})
}
