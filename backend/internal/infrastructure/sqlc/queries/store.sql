-- name: CreateStore :one
INSERT INTO stores (
    name,
    description,
    slug,
    seller_id,
    logo_url,
    banner_url,
    phone,
    email,
    address,
    status
)
VALUES (
           $1,
           $2,
           $3,
           $4,
           $5,
           $6,
           $7,
           $8,
           $9,
           $10
       )
    RETURNING
    id,
    name,
    description,
    slug,
    seller_id,
    logo_url,
    banner_url,
    phone,
    email,
    address,
    status,
    created_at,
    updated_at;


-- name: GetStoreByID :one
SELECT
    id,
    name,
    description,
    slug,
    seller_id,
    logo_url,
    banner_url,
    phone,
    email,
    address,
    status,
    created_at,
    updated_at
FROM stores
WHERE id = $1;


-- name: GetStoreBySlug :one
SELECT
    id,
    name,
    description,
    slug,
    seller_id,
    logo_url,
    banner_url,
    phone,
    email,
    address,
    status,
    created_at,
    updated_at
FROM stores
WHERE slug = $1;


-- name: PatchStore :one
UPDATE stores
SET
    name = COALESCE(sqlc.narg('name'), name),
    description = COALESCE(sqlc.narg('description'), description),
    slug = COALESCE(sqlc.narg('slug'), slug),
    logo_url = COALESCE(sqlc.narg('logo_url'), logo_url),
    banner_url = COALESCE(sqlc.narg('banner_url'), banner_url),
    phone = COALESCE(sqlc.narg('phone'), phone),
    email = COALESCE(sqlc.narg('email'), email),
    address = COALESCE(sqlc.narg('address'), address),
    status = COALESCE(sqlc.narg('status'), status),
    updated_at = now()
WHERE id = sqlc.arg('id')
    RETURNING
    id,
    name,
    description,
    slug,
    seller_id,
    logo_url,
    banner_url,
    phone,
    email,
    address,
    status,
    created_at,
    updated_at;


-- name: DeleteStore :exec
DELETE FROM stores
WHERE id = $1;


-- name: GetStoresList :many
SELECT
    id,
    name,
    description,
    slug,
    seller_id,
    logo_url,
    banner_url,
    phone,
    email,
    address,
    status,
    created_at,
    updated_at
FROM stores
WHERE
    (
        sqlc.narg('search')::text IS NULL
        OR sqlc.narg('search')::text = ''
        OR name ILIKE '%' || sqlc.narg('search')::text || '%'
        OR description ILIKE '%' || sqlc.narg('search')::text || '%'
        OR slug ILIKE '%' || sqlc.narg('search')::text || '%'
        )
  AND (
    sqlc.narg('seller_id')::uuid IS NULL
        OR seller_id = sqlc.narg('seller_id')::uuid
    )
  AND (
    sqlc.narg('status')::text IS NULL
        OR status = sqlc.narg('status')::text
    )
ORDER BY
    CASE
        WHEN sqlc.narg('sort_by')::text = 'name'
        AND sqlc.narg('sort_order')::text = 'asc'
        THEN name
END ASC,

    CASE
        WHEN sqlc.narg('sort_by')::text = 'name'
            AND sqlc.narg('sort_order')::text = 'desc'
        THEN name
END DESC,

    CASE
        WHEN sqlc.narg('sort_by')::text = 'created_at'
            AND sqlc.narg('sort_order')::text = 'asc'
        THEN created_at
END ASC,

    CASE
        WHEN sqlc.narg('sort_by')::text = 'created_at'
            AND sqlc.narg('sort_order')::text = 'desc'
        THEN created_at
END DESC,

    created_at DESC
LIMIT COALESCE(sqlc.narg('limit')::int, 20)
OFFSET COALESCE(sqlc.narg('offset')::int, 0);



-- name: CountStoresList :one
SELECT COUNT(*)::bigint
FROM stores
WHERE
    (
        sqlc.narg('search')::text IS NULL
        OR sqlc.narg('search')::text = ''
        OR name ILIKE '%' || sqlc.narg('search')::text || '%'
        OR description ILIKE '%' || sqlc.narg('search')::text || '%'
        OR slug ILIKE '%' || sqlc.narg('search')::text || '%'
        )
  AND (
    sqlc.narg('seller_id')::uuid IS NULL
        OR seller_id = sqlc.narg('seller_id')::uuid
    )
  AND (
    sqlc.narg('status')::text IS NULL
        OR status = sqlc.narg('status')::text
    );