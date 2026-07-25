-- name: CreateProduct :one
INSERT INTO products (
    store_id,
    category_id,
    name,
    slug,
    description,
    price,
    old_price,
    sku,
    status,
    main_image_url,
    supplier_url
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
           $10,
           $11
       )
    RETURNING
    id,
    store_id,
    category_id,
    name,
    slug,
    description,
    price,
    old_price,
    sku,
    status,
    main_image_url,
    supplier_url,
    created_at,
    updated_at;


-- name: GetProductByID :one
SELECT
    id,
    store_id,
    category_id,
    name,
    slug,
    description,
    price,
    old_price,
    sku,
    status,
    main_image_url,
    supplier_url,
    created_at,
    updated_at
FROM products
WHERE id = $1;


-- name: GetProductBySlug :one
SELECT
    id,
    store_id,
    category_id,
    name,
    slug,
    description,
    price,
    old_price,
    sku,
    status,
    main_image_url,
    supplier_url,
    created_at,
    updated_at
FROM products
WHERE store_id = $1
  AND slug = $2;


-- name: PatchProduct :one
UPDATE products
SET
    category_id = COALESCE(sqlc.narg('category_id')::uuid, category_id),
    name = COALESCE(sqlc.narg('name')::text, name),
    slug = COALESCE(sqlc.narg('slug')::text, slug),
    description = COALESCE(sqlc.narg('description')::text, description),
    price = COALESCE(sqlc.narg('price')::bigint, price),
    old_price = COALESCE(sqlc.narg('old_price')::bigint, old_price),
    sku = COALESCE(sqlc.narg('sku')::text, sku),
    status = COALESCE(sqlc.narg('status')::product_status, status),
    main_image_url = COALESCE(sqlc.narg('main_image_url')::text, main_image_url),
    supplier_url = COALESCE(sqlc.narg('supplier_url')::text, supplier_url),
    updated_at = now()
WHERE id = sqlc.arg('id')::uuid
RETURNING
    id,
    store_id,
    category_id,
    name,
    slug,
    description,
    price,
    old_price,
    sku,
    status,
    main_image_url,
    supplier_url,
    created_at,
    updated_at;


-- name: DeleteProduct :exec
DELETE FROM products
WHERE id = $1;


-- name: GetProductsList :many
WITH RECURSIVE category_tree AS (
    SELECT
        id
    FROM product_categories
    WHERE id = sqlc.narg('category_id')::uuid

UNION ALL

SELECT
    pc.id
FROM product_categories pc
         INNER JOIN category_tree ct ON pc.parent_id = ct.id
    )
SELECT
    p.id,
    p.store_id,
    p.category_id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.old_price,
    p.sku,
    p.status,
    p.main_image_url,
    p.supplier_url,
    p.created_at,
    p.updated_at
FROM products p
WHERE
    p.store_id = sqlc.arg('store_id')::uuid
    AND (
        sqlc.narg('search')::text IS NULL
        OR sqlc.narg('search')::text = ''
        OR p.name ILIKE '%' || sqlc.narg('search')::text || '%'
        OR p.description ILIKE '%' || sqlc.narg('search')::text || '%'
        OR p.slug ILIKE '%' || sqlc.narg('search')::text || '%'
        OR p.sku ILIKE '%' || sqlc.narg('search')::text || '%'
    )
    AND (
        sqlc.narg('category_id')::uuid IS NULL
        OR p.category_id IN (
            SELECT id FROM category_tree
        )
    )
    AND (
        sqlc.narg('price_from')::bigint IS NULL
        OR p.price >= sqlc.narg('price_from')::bigint
    )
    AND (
        sqlc.narg('price_to')::bigint IS NULL
        OR p.price <= sqlc.narg('price_to')::bigint
    )
    AND (
        sqlc.narg('status')::product_status IS NULL
        OR p.status = sqlc.narg('status')::product_status
    )
    AND NOT EXISTS (
        SELECT 1
        FROM jsonb_each_text(COALESCE(sqlc.narg('attribute_filters')::text, '{}')::jsonb) filter
        WHERE NOT EXISTS (
            SELECT 1
            FROM product_attribute_values pav
            JOIN product_attributes pa ON pa.id = pav.product_attribute_id
            WHERE pav.product_id = p.id
              AND pa.id::text = filter.key
              AND pa.store_id = p.store_id
              AND pa.is_filter = TRUE
              AND (pa.category_id IS NULL OR pa.category_id = p.category_id)
              AND (
                  (pa.type = 'text' AND pav.value_text = filter.value)
                  OR (pa.type = 'number' AND pav.value_number::text = filter.value)
                  OR (pa.type = 'bool' AND pav.value_bool::text = filter.value)
                  OR (pa.type = 'select' AND pav.option_id::text = filter.value)
              )
        )
    )
ORDER BY p.created_at DESC
    LIMIT COALESCE(sqlc.narg('limit')::int, 20)
OFFSET COALESCE(sqlc.narg('offset')::int, 0);

-- name: CountProductsList :one
WITH RECURSIVE category_tree AS (
    SELECT
        id
    FROM product_categories
    WHERE id = sqlc.narg('category_id')::uuid

UNION ALL

SELECT
    pc.id
FROM product_categories pc
         INNER JOIN category_tree ct ON pc.parent_id = ct.id
    )
SELECT COUNT(*)::bigint
FROM products p
WHERE
    p.store_id = sqlc.arg('store_id')::uuid
    AND (
        sqlc.narg('search')::text IS NULL
        OR sqlc.narg('search')::text = ''
        OR p.name ILIKE '%' || sqlc.narg('search')::text || '%'
        OR p.description ILIKE '%' || sqlc.narg('search')::text || '%'
        OR p.slug ILIKE '%' || sqlc.narg('search')::text || '%'
        OR p.sku ILIKE '%' || sqlc.narg('search')::text || '%'
    )
    AND (
        sqlc.narg('category_id')::uuid IS NULL
        OR p.category_id IN (
            SELECT id FROM category_tree
        )
    )
    AND (
        sqlc.narg('price_from')::bigint IS NULL
        OR p.price >= sqlc.narg('price_from')::bigint
    )
    AND (
        sqlc.narg('price_to')::bigint IS NULL
        OR p.price <= sqlc.narg('price_to')::bigint
    )
    AND (
        sqlc.narg('status')::product_status IS NULL
        OR p.status = sqlc.narg('status')::product_status
    )
    AND NOT EXISTS (
        SELECT 1
        FROM jsonb_each_text(COALESCE(sqlc.narg('attribute_filters')::text, '{}')::jsonb) filter
        WHERE NOT EXISTS (
            SELECT 1
            FROM product_attribute_values pav
            JOIN product_attributes pa ON pa.id = pav.product_attribute_id
            WHERE pav.product_id = p.id
              AND pa.id::text = filter.key
              AND pa.store_id = p.store_id
              AND pa.is_filter = TRUE
              AND (pa.category_id IS NULL OR pa.category_id = p.category_id)
              AND (
                  (pa.type = 'text' AND pav.value_text = filter.value)
                  OR (pa.type = 'number' AND pav.value_number::text = filter.value)
                  OR (pa.type = 'bool' AND pav.value_bool::text = filter.value)
                  OR (pa.type = 'select' AND pav.option_id::text = filter.value)
              )
        )
    );
