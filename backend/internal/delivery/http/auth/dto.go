package auth

import (
	"tradeOn/internal/delivery/http/user"
)

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResult struct {
	User        user.UserDTO `json:"user"`
	AccessToken string       `json:"access_token"`
}
