-- name: CreateRefreshToken :one
INSERT INTO refresh_tokens (
    id,
    refresh_token_hash,
    user_id,
    user_agent,
    ip_address,
    user_device,
    revoked_at,
    created_at,
    expires_at
) VALUES (
             $1,
             $2,
             $3,
             $4,
             $5,
             $6,
             $7,
             $8,
             $9
         )
    RETURNING
    id,
    refresh_token_hash,
    user_id,
    user_agent,
    ip_address,
    user_device,
    revoked_at,
    created_at,
    expires_at;

-- name: GetRefreshTokenByHash :one
SELECT
    id,
    refresh_token_hash,
    user_id,
    user_agent,
    ip_address,
    user_device,
    revoked_at,
    created_at,
    expires_at
FROM refresh_tokens
WHERE refresh_token_hash = $1
    LIMIT 1;

-- name: ListActiveRefreshTokensByUserID :many
SELECT
    id,
    refresh_token_hash,
    user_id,
    user_agent,
    ip_address,
    user_device,
    revoked_at,
    created_at,
    expires_at
FROM refresh_tokens
WHERE user_id = $1
  AND revoked_at IS NULL
  AND expires_at > now()
ORDER BY created_at DESC;

-- name: RevokeRefreshTokenByHash :exec
UPDATE refresh_tokens
SET revoked_at = now()
WHERE refresh_token_hash = $1
  AND revoked_at IS NULL;

-- name: RevokeAllRefreshTokensByUserID :exec
UPDATE refresh_tokens
SET revoked_at = now()
WHERE user_id = $1
  AND revoked_at IS NULL;

-- name: DeleteExpiredRefreshTokens :exec
DELETE FROM refresh_tokens
WHERE expires_at <= now();