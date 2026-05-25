package user

import (
	"strings"
	"tradeOn/internal/domain/models"
)

func ToUserDTO(user models.User) UserDTO {
	return UserDTO{
		ID:         user.ID,
		Role:       user.Role,
		Email:      user.Email,
		Username:   user.Username,
		AvatarUrl:  user.AvatarUrl,
		AuthMethod: user.AuthMethod,
		CreatedAt:  user.CreatedAt,
		UpdatedAt:  user.UpdatedAt,
		LastLogin:  user.LastLogin,
		Status:     user.Status,
	}
}

func ToUserDTOs(users []models.User) []UserDTO {
	result := make([]UserDTO, 0, len(users))
	for _, user := range users {
		result = append(result, ToUserDTO(user))
	}
	return result
}

func createUserRequestToUser(req CreateUserRequest) models.User {
	return models.User{
		Email:        strings.TrimSpace(req.Email),
		Role:         req.Role,
		PasswordHash: &req.Password,
		AvatarUrl:    req.AvatarUrl,
		Username:     strings.TrimSpace(req.Username),
		AuthMethod:   models.AuthMethodEmail,
		Status:       models.UserStatusActive,
	}
}
func requestToPatchUserParams(req PatchUserRequest) models.PatchUserParams {
	return models.PatchUserParams{
		Role:         req.Role,
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: req.Password,
		AvatarUrl:    req.AvatarUrl,
		Status:       req.Status,
	}
}
