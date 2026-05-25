package mappers

import (
	"tradeOn/internal/domain/models"
	generated2 "tradeOn/internal/infrastructure/sqlc/generated"
)

func ToDomainUser(user generated2.User) models.User {
	return models.User{
		ID:           UuidToString(user.ID),
		Role:         models.Role(user.Role),
		Email:        user.Email,
		Username:     user.Username,
		PasswordHash: pgTextToStringPtr(user.PasswordHash),
		AvatarUrl:    pgTextToStringPtr(user.AvatarUrl),
		AuthMethod:   models.AuthMethod(user.AuthMethod),
		CreatedAt:    pgTimestamptzToTime(user.CreatedAt),
		UpdatedAt:    pgTimestamptzToTime(user.UpdatedAt),
		LastLogin:    pgTimestamptzToTimePtr(user.LastLogin),
		Status:       models.UserStatus(user.Status),
	}
}

func ToDomainUsers(users []generated2.User) []models.User {
	result := make([]models.User, 0, len(users))

	for _, user := range users {
		result = append(result, ToDomainUser(user))
	}

	return result
}

func ToCreateUserParams(user models.User) generated2.CreateUserParams {
	return generated2.CreateUserParams{
		Role:         string(user.Role),
		Email:        user.Email,
		Username:     user.Username,
		PasswordHash: stringPtrToPgText(user.PasswordHash),
		AvatarUrl:    stringPtrToPgText(user.AvatarUrl),
		AuthMethod:   string(user.AuthMethod),
		Status:       string(user.Status),
	}
}

func ToPatchUserParams(id string, params models.PatchUserParams) generated2.PatchUserParams {
	return generated2.PatchUserParams{
		ID:           StringToUUID(id),
		Role:         stringPtrToPgText((*string)(params.Role)),
		Email:        stringPtrToPgText(params.Email),
		Username:     stringPtrToPgText(params.Username),
		PasswordHash: stringPtrToPgText(params.PasswordHash),
		AvatarUrl:    stringPtrToPgText(params.AvatarUrl),
		Status:       stringPtrToPgText((*string)(params.Status)),
	}
}
func ToGetUsersListParams(params models.ListUserParams) generated2.GetUsersListParams {
	return generated2.GetUsersListParams{
		Search: stringPtrToPgText(params.Search),
		Role:   stringPtrToPgText((*string)(params.Role)),
		Status: stringPtrToPgText((*string)(params.Status)),
	}
}
