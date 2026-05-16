package models

import "time"

type UserStatus string

const (
	UserStatusBlocked  UserStatus = "blocked"
	UserStatusActive   UserStatus = "active"
	UserStatusInactive UserStatus = "inactive"
)

type AuthMethod string

const (
	AuthMethodEmail  AuthMethod = "email"
	AuthMethodGoogle AuthMethod = "google"
)

type Role string

const (
	RoleAdmin  Role = "admin"
	RoleSeller Role = "seller"
	RoleUser   Role = "user"
)

type User struct {
	ID           string
	Role         Role
	Email        string
	Username     string
	PasswordHash *string
	Avatar       *string
	AuthMethod   AuthMethod
	CreatedAt    time.Time
	UpdatedAt    time.Time
	LastLogin    *time.Time
	Status       UserStatus
}

type ListUserParams struct {
	Role   *Role
	Status *UserStatus
	Search *string
}
type PatchUserParams struct {
	Role         *Role
	Email        *string
	Username     *string
	PasswordHash *string
	Avatar       *string
	Status       *UserStatus
}
