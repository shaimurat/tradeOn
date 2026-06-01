-- name: CreateProductCategory :one
INSERT INTO product_categories (
    store_id,
    name,
    description,
    parent_id,
    is_active
)
VALUES (
           $1,
           $2,
           $3,
           $4,
           true
       )
    RETURNING
    id,
    store_id,
    name,
    description,
    parent_id,
    is_active;

-- name: UpdateProductCategory :one
UPDATE product_categories
SET
    name = COALESCE(sqlc.narg('name'), name),
    description = COALESCE(sqlc.narg('description'), description),
    parent_id = COALESCE(sqlc.narg('parent_id'), parent_id)
WHERE id = sqlc.arg('id')
  AND is_active = true
    RETURNING
    id,
    store_id,
    name,
    description,
    parent_id,
    is_active;

-- name: DeleteProductCategory :exec
UPDATE product_categories
SET is_active = false
WHERE id = $1
  AND is_active = true;

-- name: ListProductCategories :many
SELECT
    id,
    store_id,
    name,
    description,
    parent_id,
    is_active
FROM product_categories
WHERE store_id = sqlc.arg('store_id')
  AND is_active = true
  AND (
    sqlc.narg('search')::text IS NULL
      OR name ILIKE '%' || sqlc.narg('search') || '%'
      OR description ILIKE '%' || sqlc.narg('search') || '%'
    )
  AND (
    sqlc.arg('only_root')::boolean = false
      OR parent_id IS NULL
    )
  AND (
    sqlc.narg('parent_id')::uuid IS NULL
      OR parent_id = sqlc.narg('parent_id')::uuid
    )
ORDER BY name ASC;

-- name: CountProductCategories :one
SELECT COUNT(*)::bigint
FROM product_categories
WHERE store_id = sqlc.arg('store_id')
  AND is_active = true
  AND (
    sqlc.narg('search')::text IS NULL
      OR sqlc.narg('search')::text = ''
      OR name ILIKE '%' || sqlc.narg('search')::text || '%'
      OR description ILIKE '%' || sqlc.narg('search')::text || '%'
    )
  AND (
    sqlc.arg('only_root')::boolean = false
      OR parent_id IS NULL
    )
  AND (
    sqlc.narg('parent_id')::uuid IS NULL
      OR parent_id = sqlc.narg('parent_id')::uuid
    );

-- name: GetProductCategoryByID :one
SELECT
    id,
    store_id,
    name,
    description,
    parent_id,
    is_active
FROM product_categories
WHERE id = $1;