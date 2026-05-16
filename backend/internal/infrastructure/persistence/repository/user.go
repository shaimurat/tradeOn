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

func (u *UserRepository) Create(ctx context.Context, user models.User) (*models.User, error) {
	pgUser, err := u.q.CreateUser(ctx, mappers.ToCreateUserParams(user))
	if err != nil {
		return nil, mappers.MapDBError(err)
	}
	user = mappers.ToDomainUser(pgUser)
	return &user, nil
}

func (u *UserRepository) Update(ctx context.Context, id string, params models.PatchUserParams) (*models.User, error) {
	_, err := u.q.PatchUser(ctx, mappers.ToPatchUserParams(id, params))
	if err != nil {
		return nil, mappers.MapDBError(err)
	}
	pgUser, err := u.q.GetUserByID(ctx, mappers.StringToUUID(id))
	if err != nil {
		return nil, mappers.MapDBError(err)
	}
	user := mappers.ToDomainUser(pgUser)
	return &user, nil
}

func (u *UserRepository) Delete(ctx context.Context, id string) error {
	uid := mappers.StringToUUID(id)
	err := u.q.DeleteUser(ctx, uid)
	if err != nil {
		return mappers.MapDBError(err)
	}
	return nil
}

func (u *UserRepository) Get(ctx context.Context, id string) (*models.User, error) {
	uid := mappers.StringToUUID(id)
	pgUser, err := u.q.GetUserByID(ctx, uid)
	if err != nil {
		return nil, mappers.MapDBError(err)
	}
	user := mappers.ToDomainUser(pgUser)
	return &user, nil
}

func (u *UserRepository) GetList(ctx context.Context, params models.ListUserParams) ([]models.User, error) {
	pgUsers, err := u.q.GetUsersList(ctx, mappers.ToGetUsersListParams(params))
	if err != nil {
		return nil, mappers.MapDBError(err)
	}
	users := mappers.ToDomainUsers(pgUsers)
	return users, nil
}

func (u *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	exists, err := u.q.ExistsUserByEmail(ctx, email)
	if err != nil {
		return false, mappers.MapDBError(err)
	}

	return exists, nil
}

func (u *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	pgUser, err := u.q.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, mappers.MapDBError(err)
	}

	user := mappers.ToDomainUser(pgUser)

	return &user, nil
}
