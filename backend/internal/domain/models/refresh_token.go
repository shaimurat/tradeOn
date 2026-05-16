package models

import "time"

type RefreshToken struct {
	ID               string
	RefreshTokenHash string
	UserID           string
	UserAgent        string
	IpAddress        string
	UserDevice       string
	RevokedAt        *time.Time
	CreatedAt        time.Time
	ExpiresAt        time.Time
}
