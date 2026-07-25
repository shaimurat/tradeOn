package app

import (
	"context"
	"log"
	"log/slog"
	"time"
	"tradeOn/internal/config"
	"tradeOn/internal/delivery/http/auth"
	"tradeOn/internal/delivery/http/middleware"
	"tradeOn/internal/delivery/http/product"
	"tradeOn/internal/delivery/http/store"
	"tradeOn/internal/delivery/http/user"
	"tradeOn/internal/infrastructure/persistence/repository"
	"tradeOn/internal/infrastructure/security/jwt"
	"tradeOn/internal/infrastructure/security/password"
	sqldb "tradeOn/internal/infrastructure/sqlc/generated"
	"tradeOn/internal/platform/database"
	"tradeOn/internal/usecase/auth_uc"
	"tradeOn/internal/usecase/product_attribute_uc"
	"tradeOn/internal/usecase/product_category_uc"
	"tradeOn/internal/usecase/product_uc"
	"tradeOn/internal/usecase/store_uc"
	"tradeOn/internal/usecase/user_uc"
)

const PasswordHashCost = 12

type Container struct {
	AuthMiddleware          *middleware.AuthMiddleware
	AuthHandler             *auth.AuthHandler
	UserHandler             *user.UserHandler
	StoreHandler            *store.StoreHandler
	ProductHandler          *product.ProductHandler
	ProductCategoryHandler  *product.ProductCategoryHandler
	ProductAttributeHandler *product.ProductAttributeHandler
}

func NewContainer(cfg *config.Config, logger *slog.Logger) *Container {
	pool, err := database.NewPostgresPool(context.Background(), cfg.DatabaseConfig.DatabaseUrl)
	if err != nil {
		log.Fatal(err)
	}
	db := sqldb.New(pool)

	//Repos
	userRepo := repository.NewUserRepository(db)
	refreshTokenRepo := repository.NewRefreshTokenRepository(db)
	storeRepo := repository.NewStoreRepository(db)
	productRepo := repository.NewProductRepository(db)
	productCategoryRepo := repository.NewProductCategoryRepository(db)
	productAttributeRepo := repository.NewProductAttributeRepository(db)
	productAttributeOptionRepo := repository.NewProductAttributeOptionRepository(db)
	productAttributeValueRepo := repository.NewProductAttributeValueRepository(db)

	//Services
	jwtService := jwt.NewJwtService(
		cfg.JWTConfig.JwtAccessSecret,
		cfg.JWTConfig.JwtRefreshSecret,
		time.Duration(cfg.JWTConfig.JwtAccessExpiresMin)*time.Minute,
		time.Duration(cfg.JWTConfig.JwtRefreshExpiresHours)*time.Hour,
	)
	hasher := password.NewBcryptHasher(PasswordHashCost)

	//UseCases
	authUseCase := auth_uc.NewAuthUseCase(userRepo, refreshTokenRepo, hasher, jwtService, time.Duration(cfg.JWTConfig.JwtRefreshExpiresHours)*time.Hour, logger)
	userUseCase := user_uc.NewUserUseCase(userRepo, hasher)
	storeUseCase := store_uc.NewStoreUseCase(storeRepo, logger)
	productUseCase := product_uc.NewProductUseCase(productRepo, productCategoryRepo, storeRepo, productAttributeValueRepo, logger)
	productCategoryUseCase := product_category_uc.NewProductCategoryUseCase(productCategoryRepo, storeRepo, logger)
	productAttributeUseCase := product_attribute_uc.NewProductAttributeUseCase(
		productAttributeRepo, productAttributeOptionRepo, productAttributeValueRepo, productRepo, productCategoryRepo, storeRepo, logger,
	)

	//Handlers
	authHandler := auth.NewAuthHandler(authUseCase, cfg)
	UserHandler := user.NewUserHandler(userUseCase)
	storeHandler := store.NewStoreHandler(storeUseCase)
	productHandler := product.NewProductHandler(productUseCase)
	productCategoryHandler := product.NewProductCategoryHandler(productCategoryUseCase)
	productAttributeHandler := product.NewProductAttributeHandler(productAttributeUseCase)

	//Middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtService, logger)
	return &Container{
		AuthMiddleware:          authMiddleware,
		AuthHandler:             authHandler,
		UserHandler:             UserHandler,
		StoreHandler:            storeHandler,
		ProductHandler:          productHandler,
		ProductCategoryHandler:  productCategoryHandler,
		ProductAttributeHandler: productAttributeHandler,
	}
}
