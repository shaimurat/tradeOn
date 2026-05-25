package user

import (
	"time"
	"tradeOn/internal/domain/models"
)

type UserDTO struct {
	ID         string            `json:"id"`
	Role       models.Role       `json:"role"`
	Email      string            `json:"email"`
	Username   string            `json:"username"`
	AvatarUrl  *string           `json:"avatar_url,omitempty"`
	AuthMethod models.AuthMethod `json:"auth_method"`
	CreatedAt  time.Time         `json:"created_at"`
	UpdatedAt  time.Time         `json:"updated_at"`
	LastLogin  *time.Time        `json:"last_login,omitempty"`
	Status     models.UserStatus `json:"status"`
}

type UserResponse struct {
	User UserDTO `json:"user"`
}

type ListUserRequest struct {
	Role   *models.Role       `form:"role" binding:"omitempty,oneof=admin seller customer"`
	Status *models.UserStatus `form:"status" binding:"omitempty,oneof=active inactive blocked"`
	Search *string            `form:"search" binding:"omitempty,max=255"`
}

type ListUserResponse struct {
	Users []UserDTO `json:"users"`
	Count int       `json:"count"`
}

type PatchUserRequest struct {
	Role      *models.Role       `json:"role,omitempty" binding:"omitempty,oneof=admin seller customer"`
	Email     *string            `json:"email,omitempty" binding:"omitempty,email,max=255"`
	Username  *string            `json:"username,omitempty" binding:"omitempty,min=3,max=100"`
	Password  *string            `json:"password,omitempty" binding:"omitempty,min=8,max=72"`
	AvatarUrl *string            `json:"avatar_url,omitempty" binding:"omitempty,max=1000"`
	Status    *models.UserStatus `json:"status,omitempty" binding:"omitempty,oneof=active inactive blocked"`
}

type CreateUserRequest struct {
	Role      models.Role `json:"role" binding:"required,oneof=admin seller customer"`
	Email     string      `json:"email" binding:"required,email,max=255"`
	Username  string      `json:"username" binding:"required,min=3,max=100"`
	AvatarUrl *string     `json:"avatar_url,omitempty" binding:"omitempty,max=1000"`
	Password  string      `json:"password" binding:"required,min=8,max=72"`
}
