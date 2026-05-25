package middleware

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

func (m *AuthMiddleware) RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		m.logger.Info("http request",
			slog.String("method", c.Request.Method),
			slog.String("path", c.Request.URL.Path),
			slog.Int("status", c.Writer.Status()),
			slog.String("ip", c.ClientIP()),
			slog.Duration("duration", time.Since(start)),
		)
	}
}
