package normalize

import "strings"

func String(value string) string {
	return strings.TrimSpace(value)
}

func LowerString(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}
