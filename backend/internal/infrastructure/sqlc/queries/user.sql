-- name: CreateUser :one
INSERT INTO users (
    role,
    email,
    username,
    password_hash,
    avatar_url,
    auth_method,
    status
) VALUES (
             $1, $2, $3, $4, $5, $6, $7
         )
    RETURNING
    id,
    role,
    email,
    username,
    password_hash,
    avatar_url,
    auth_method,
    created_at,
    updated_at,
    last_login,
    status;


-- name: UpdateUser :one
UPDATE users
SET
    role = $2,
    email = $3,
    username = $4,
    password_hash = $5,
    avatar_url = $6,
    auth_method = $7,
    status = $8,
    updated_at = now()
WHERE id = $1
    RETURNING
    id,
    role,
    email,
    username,
    password_hash,
    avatar_url,
    auth_method,
    created_at,
    updated_at,
    last_login,
    status;


-- name: PatchUser :one
UPDATE users
SET
    role = COALESCE(sqlc.narg('role'), role),
    email = COALESCE(sqlc.narg('email'), email),
    username = COALESCE(sqlc.narg('username'), username),
    password_hash = COALESCE(sqlc.narg('password_hash'), password_hash),
    avatar_url = COALESCE(sqlc.narg('avatar_url'), avatar_url),
    status = COALESCE(sqlc.narg('status'), status),
    updated_at = now()
WHERE id = sqlc.arg('id')
    RETURNING
    id,
    role,
    email,
    username,
    password_hash,
    avatar_url,
    created_at,
    updated_at,
    last_login,
    status;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;


-- name: GetUserByID :one
SELECT
    id,
    role,
    email,
    username,
    password_hash,
    avatar_url,
    auth_method,
    created_at,
    updated_at,
    last_login,
    status
FROM users
WHERE id = $1;


-- name: GetUsersList :many
SELECT
    id,
    role,
    email,
    username,
    password_hash,
    avatar_url,
    auth_method,
    created_at,
    updated_at,
    last_login,
    status
FROM users
WHERE
    (
        sqlc.narg('search')::text IS NULL
        OR sqlc.narg('search')::text = ''
        OR email ILIKE '%' || sqlc.narg('search')::text || '%'
        OR username ILIKE '%' || sqlc.narg('search')::text || '%'
        )
  AND (
    sqlc.narg('role')::text IS NULL
        OR role = sqlc.narg('role')::text
    )
  AND (
    sqlc.narg('status')::text IS NULL
        OR status = sqlc.narg('status')::text
    )
ORDER BY created_at DESC;




-- name: ExistsUserByEmail :one
SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE email = $1
);

-- name: GetUserByEmail :one
SELECT
    id,
    role,
    email,
    username,
    password_hash,
    avatar_url,
    auth_method,
    created_at,
    updated_at,
    last_login,
    status
FROM users
WHERE email = $1
    LIMIT 1;

-- name: UpdateUserLastLoginByEmail :exec
UPDATE users
SET last_login = now()
WHERE email = $1;