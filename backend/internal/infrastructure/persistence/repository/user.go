package repository

import (
	"context"
	"tradeOn/internal/domain/models"
	"tradeOn/internal/infrastructure/persistence/mappers"
	sqldb "tradeOn/internal/infrastructure/sqlc/generated"
)

type UserRepository struct {
	q *sqldb.Queries
}

func NewUserRepository(q *sqldb.Queries) *UserRepository {
	return &UserRepository{
		q: q,
	}
}

func (r *UserRepository) Create(ctx context.Context, user models.User) (*models.User, error) {
	pgUser, err := r.q.CreateUser(ctx, mappers.ToCreateUserParams(user))
	if err != nil {
		return nil, err
	}
	user = mappers.ToDomainUser(pgUser)
	return &user, nil
}

func (r *UserRepository) Update(ctx context.Context, id string, params models.PatchUserParams) (*models.User, error) {
	_, err := r.q.PatchUser(ctx, mappers.ToPatchUserParams(id, params))
	if err != nil {
		return nil, err
	}
	pgUser, err := r.q.GetUserByID(ctx, mappers.StringToUUID(id))
	if err != nil {
		return nil, err
	}
	user := mappers.ToDomainUser(pgUser)
	return &user, nil
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	uid := mappers.StringToUUID(id)
	err := r.q.DeleteUser(ctx, uid)
	if err != nil {
		return err
	}
	return nil
}

func (r *UserRepository) Get(ctx context.Context, id string) (*models.User, error) {
	uid := mappers.StringToUUID(id)
	pgUser, err := r.q.GetUserByID(ctx, uid)
	if err != nil {
		return nil, err
	}
	user := mappers.ToDomainUser(pgUser)
	return &user, nil
}

func (r *UserRepository) GetList(ctx context.Context, params models.ListUserParams) ([]models.User, error) {
	pgUsers, err := r.q.GetUsersList(ctx, mappers.ToGetUsersListParams(params))
	if err != nil {
		return nil, err
	}
	users := mappers.ToDomainUsers(pgUsers)
	return users, nil
}

func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	exists, err := r.q.ExistsUserByEmail(ctx, email)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	pgUser, err := r.q.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	user := mappers.ToDomainUser(pgUser)

	return &user, nil
}

func (r *UserRepository) UpdateLastLogin(ctx context.Context, email string) error {
	err := r.q.UpdateUserLastLoginByEmail(ctx, email)
	if err != nil {
		return err
	}
	return nil
}
