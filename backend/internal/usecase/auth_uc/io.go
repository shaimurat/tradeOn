package auth_uc

import "tradeOn/internal/domain/models"

type RegisterInput struct {
	Email      string
	Username   string
	Password   string
	UserAgent  string
	IpAddress  string
	UserDevice string
}

type LoginInput struct {
	Email      string
	Password   string
	UserAgent  string
	IpAddress  string
	UserDevice string
}

type RefreshInput struct {
	RefreshToken string
	UserAgent    string
	IpAddress    string
	UserDevice   string
}

type LogoutInput struct {
	RefreshToken string
}

type AuthResult struct {
	User         *models.User
	AccessToken  string
	RefreshToken string
}
type issuedTokens struct {
	AccessToken  string
	RefreshToken string
}
