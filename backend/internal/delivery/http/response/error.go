package response

import (
	"errors"
	"net/http"
	"reflect"
	"strings"
	"tradeOn/internal/domain/models/errs"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

func HandleDomainError(c *gin.Context, err error) {
	var duplicateErr errs.DuplicateError

	switch {
	case errors.As(err, &duplicateErr):
		c.JSON(http.StatusConflict, ErrorResponse{
			Error: errorDetail{
				Code:    "DUPLICATE_VALUE",
				Message: "Duplicate value",
				Fields: map[string]string{
					duplicateErr.Field: duplicateErr.Message,
				},
			},
		})
	case errors.Is(err, errs.ErrInvalidInput):
		Error(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid input")

	case errors.Is(err, errs.ErrInvalidCredentials):
		Error(c, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Invalid email or password")

	case errors.Is(err, errs.ErrUnauthorized):
		Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized")

	case errors.Is(err, errs.ErrForbidden):
		Error(c, http.StatusForbidden, "FORBIDDEN", "Forbidden")

	case errors.Is(err, errs.ErrInvalidToken):
		Error(c, http.StatusUnauthorized, "INVALID_TOKEN", "Invalid token")

	case errors.Is(err, errs.ErrTokenExpired):
		Error(c, http.StatusUnauthorized, "TOKEN_EXPIRED", "Token expired")

	case errors.Is(err, errs.ErrNotFound):
		Error(c, http.StatusNotFound, "NOT_FOUND", "Resource not found")

	case errors.Is(err, errs.ErrAlreadyExists):
		Error(c, http.StatusConflict, "ALREADY_EXISTS", "Resource already exists")

	default:
		Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Internal server error")
	}
}

type ErrorResponse struct {
	Error errorDetail `json:"error"`
}

type errorDetail struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

func Error(c *gin.Context, status int, code string, message string) {
	c.JSON(status, ErrorResponse{
		Error: errorDetail{
			Code:    code,
			Message: message,
		},
	})
}

func ValidationError(c *gin.Context, fields map[string]string) {
	c.JSON(http.StatusBadRequest, ErrorResponse{
		Error: errorDetail{
			Code:    "VALIDATION_ERROR",
			Message: "Validation failed",
			Fields:  fields,
		},
	})
}
func ErrJsonBindResponse(c *gin.Context, err error, req any) {
	var validationErrs validator.ValidationErrors

	if errors.As(err, &validationErrs) {
		fields := make(map[string]string)

		for _, fieldErr := range validationErrs {
			fieldName := getJSONFieldName(req, fieldErr.StructField())
			fields[fieldName] = validationMessage(fieldErr)
		}

		ValidationError(c, fields)
		return
	}

	c.JSON(http.StatusBadRequest, ErrorResponse{
		Error: errorDetail{
			Code:    "INVALID_JSON",
			Message: "Invalid request body",
		},
	})
}

func validationMessage(fieldErr validator.FieldError) string {
	switch fieldErr.Tag() {
	case "required":
		return "field is required"
	case "email":
		return "invalid email format"
	case "min":
		return "field is too short"
	case "max":
		return "field is too long"
	case "oneof":
		return "invalid value"
	case "url":
		return "invalid url"
	default:
		return "invalid field"
	}
}

func getJSONFieldName(req any, structFieldName string) string {
	t := reflect.TypeOf(req)

	if t.Kind() == reflect.Pointer {
		t = t.Elem()
	}

	field, ok := t.FieldByName(structFieldName)
	if !ok {
		return structFieldName
	}

	jsonTag := field.Tag.Get("json")
	if jsonTag == "" {
		return structFieldName
	}

	name := strings.Split(jsonTag, ",")[0]
	if name == "" || name == "-" {
		return structFieldName
	}

	return name
}
