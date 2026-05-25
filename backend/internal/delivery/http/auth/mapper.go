package auth

import (
	"strings"
	"tradeOn/internal/delivery/http/user"
	"tradeOn/internal/shared/normalize"
	"tradeOn/internal/usecase/auth_uc"
)

func registerReqToInput(req RegisterRequest) auth_uc.RegisterInput {
	return auth_uc.RegisterInput{
		Email:    normalize.LowerString(req.Email),
		Username: strings.TrimSpace(req.Username),
		Password: req.Password,
	}
}

func loginReqToInput(req loginRequest) auth_uc.LoginInput {
	return auth_uc.LoginInput{
		Email:    normalize.LowerString(req.Email),
		Password: req.Password,
	}
}

func authResToDto(res auth_uc.AuthResult) AuthResult {
	return AuthResult{
		User:        user.ToUserDTO(*res.User),
		AccessToken: res.AccessToken,
	}
}
