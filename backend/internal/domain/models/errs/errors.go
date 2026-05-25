package errs

import (
	"errors"
	"fmt"
)

var (
	ErrInvalidInput       = errors.New("invalid input")
	ErrNotFound           = errors.New("not found")
	ErrAlreadyExists      = errors.New("already exists")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrForbidden          = errors.New("forbidden")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidToken       = errors.New("invalid token")
	ErrTokenExpired       = errors.New("token expired")
)

type DuplicateError struct {
	Field   string
	Message string
}

func (e DuplicateError) Error() string {
	return e.Message
}

func NewDuplicateError(field string) error {
	return DuplicateError{
		Field:   field,
		Message: fmt.Sprintf("%s already exists", field),
	}
}
