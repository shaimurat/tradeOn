-- name: CreateProductAttribute :one
INSERT INTO product_attributes (
    store_id,
    category_id,
    name,
    code,
    is_required,
    is_filter,
    type,
    unit
)
VALUES (
    sqlc.arg('store_id')::uuid,
    sqlc.narg('category_id')::uuid,
    sqlc.arg('name')::text,
    sqlc.arg('code')::text,
    sqlc.arg('is_required')::boolean,
    sqlc.arg('is_filter')::boolean,
    sqlc.arg('type')::attribute_type,
    sqlc.narg('unit')::text
)
RETURNING *;

-- name: CreateProductAttributes :many
INSERT INTO product_attributes (
    store_id,
    category_id,
    name,
    code,
    is_required,
    is_filter,
    type,
    unit
)
SELECT
    input.store_id,
    (sqlc.arg('category_ids')::uuid[])[input.ordinality],
    (sqlc.arg('names')::text[])[input.ordinality],
    (sqlc.arg('codes')::text[])[input.ordinality],
    (sqlc.arg('is_required_values')::boolean[])[input.ordinality],
    (sqlc.arg('is_filter_values')::boolean[])[input.ordinality],
    (sqlc.arg('types')::attribute_type[])[input.ordinality],
    CASE
        WHEN (sqlc.arg('has_units')::boolean[])[input.ordinality]
        THEN (sqlc.arg('units')::text[])[input.ordinality]
    END
FROM unnest(sqlc.arg('store_ids')::uuid[])
    WITH ORDINALITY AS input(store_id, ordinality)
RETURNING *;

-- name: GetProductAttributeByID :one
SELECT *
FROM product_attributes
WHERE id = sqlc.arg('id')::uuid;

-- name: ListProductAttributesByStoreID :many
SELECT *
FROM product_attributes
WHERE store_id = sqlc.arg('store_id')::uuid
ORDER BY created_at;

-- name: UpdateProductAttribute :one
UPDATE product_attributes
SET
    category_id = sqlc.narg('category_id')::uuid,
    name = sqlc.arg('name')::text,
    code = sqlc.arg('code')::text,
    is_required = sqlc.arg('is_required')::boolean,
    is_filter = sqlc.arg('is_filter')::boolean,
    type = sqlc.arg('type')::attribute_type,
    unit = sqlc.narg('unit')::text,
    updated_at = now()
WHERE id = sqlc.arg('id')::uuid
RETURNING *;

-- name: DeleteProductAttribute :exec
DELETE FROM product_attributes
WHERE id = sqlc.arg('id')::uuid;

-- name: CreateProductAttributeOption :one
INSERT INTO product_attribute_options (
    product_attribute_id,
    value,
    position
)
VALUES (
    sqlc.arg('product_attribute_id')::uuid,
    sqlc.arg('value')::text,
    sqlc.arg('position')::integer
)
RETURNING *;

-- name: CreateProductAttributeOptions :many
INSERT INTO product_attribute_options (
    product_attribute_id,
    value,
    position
)
SELECT
    input.product_attribute_id,
    (sqlc.arg('values')::text[])[input.ordinality],
    (sqlc.arg('positions')::integer[])[input.ordinality]
FROM unnest(sqlc.arg('product_attribute_ids')::uuid[])
    WITH ORDINALITY AS input(product_attribute_id, ordinality)
RETURNING *;

-- name: GetProductAttributeOptionByID :one
SELECT *
FROM product_attribute_options
WHERE id = sqlc.arg('id')::uuid;

-- name: ListProductAttributeOptionsByAttributeID :many
SELECT *
FROM product_attribute_options
WHERE product_attribute_id = sqlc.arg('product_attribute_id')::uuid
ORDER BY position, created_at;

-- name: UpdateProductAttributeOption :one
UPDATE product_attribute_options
SET
    value = sqlc.arg('value')::text,
    position = sqlc.arg('position')::integer,
    updated_at = now()
WHERE id = sqlc.arg('id')::uuid
RETURNING *;

-- name: DeleteProductAttributeOption :exec
DELETE FROM product_attribute_options
WHERE id = sqlc.arg('id')::uuid;

-- name: CreateProductAttributeValue :one
INSERT INTO product_attribute_values (
    product_id,
    product_attribute_id,
    value_text,
    value_number,
    value_bool,
    option_id
)
VALUES (
    sqlc.arg('product_id')::uuid,
    sqlc.arg('product_attribute_id')::uuid,
    sqlc.narg('value_text')::text,
    sqlc.narg('value_number')::double precision,
    sqlc.narg('value_bool')::boolean,
    sqlc.narg('option_id')::uuid
)
RETURNING *;

-- name: CreateProductAttributeValues :many
INSERT INTO product_attribute_values (
    product_id,
    product_attribute_id,
    value_text,
    value_number,
    value_bool,
    option_id
)
SELECT
    input.product_id,
    (sqlc.arg('product_attribute_ids')::uuid[])[input.ordinality],
    CASE
        WHEN (sqlc.arg('has_value_texts')::boolean[])[input.ordinality]
        THEN (sqlc.arg('value_texts')::text[])[input.ordinality]
    END,
    CASE
        WHEN (sqlc.arg('has_value_numbers')::boolean[])[input.ordinality]
        THEN (sqlc.arg('value_numbers')::double precision[])[input.ordinality]
    END,
    CASE
        WHEN (sqlc.arg('has_value_bools')::boolean[])[input.ordinality]
        THEN (sqlc.arg('value_bools')::boolean[])[input.ordinality]
    END,
    (sqlc.arg('option_ids')::uuid[])[input.ordinality]
FROM unnest(sqlc.arg('product_ids')::uuid[])
    WITH ORDINALITY AS input(product_id, ordinality)
RETURNING *;

-- name: GetProductAttributeValueByID :one
SELECT *
FROM product_attribute_values
WHERE id = sqlc.arg('id')::uuid;

-- name: ListProductAttributeValuesByProductID :many
SELECT *
FROM product_attribute_values
WHERE product_id = sqlc.arg('product_id')::uuid
ORDER BY created_at;

-- name: UpdateProductAttributeValue :one
UPDATE product_attribute_values
SET
    product_attribute_id = sqlc.arg('product_attribute_id')::uuid,
    value_text = sqlc.narg('value_text')::text,
    value_number = sqlc.narg('value_number')::double precision,
    value_bool = sqlc.narg('value_bool')::boolean,
    option_id = sqlc.narg('option_id')::uuid,
    updated_at = now()
WHERE id = sqlc.arg('id')::uuid
RETURNING *;

-- name: DeleteProductAttributeValue :exec
DELETE FROM product_attribute_values
WHERE id = sqlc.arg('id')::uuid;
