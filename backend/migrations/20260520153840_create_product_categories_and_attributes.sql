-- +goose Up
-- +goose StatementBegin

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE product_status AS ENUM (
    'draft',
    'active',
    'inactive',
    'blocked'
);

CREATE TYPE attribute_type AS ENUM (
    'text',
    'number',
    'bool',
    'select'
);

CREATE TABLE product_categories (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,

                                    name VARCHAR(255) NOT NULL,
                                    description TEXT,

                                    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,

                                    is_active BOOLEAN NOT NULL DEFAULT TRUE,

                                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                                    CONSTRAINT product_categories_name_not_empty
                                        CHECK (trim(name) <> '')
);

CREATE INDEX idx_product_categories_store_id
    ON product_categories(store_id);

CREATE INDEX idx_product_categories_parent_id
    ON product_categories(parent_id);

CREATE INDEX idx_product_categories_store_parent
    ON product_categories(store_id, parent_id);

CREATE INDEX idx_product_categories_store_active
    ON product_categories(store_id, is_active);

CREATE UNIQUE INDEX uq_product_categories_store_parent_name
    ON product_categories (
                           store_id,
                           COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid),
                           lower(name)
        );


CREATE TABLE products (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                          store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
                          category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,

                          name VARCHAR(255) NOT NULL,
                          slug VARCHAR(255) NOT NULL,
                          description TEXT,

                          price BIGINT NOT NULL,
                          old_price BIGINT,

                          sku VARCHAR(100),
                          status product_status NOT NULL DEFAULT 'draft',

                          main_image_url TEXT,
                          supplier_url TEXT,

                          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                          CONSTRAINT products_name_not_empty
                              CHECK (trim(name) <> ''),

                          CONSTRAINT products_slug_not_empty
                              CHECK (trim(slug) <> ''),

                          CONSTRAINT products_price_non_negative
                              CHECK (price >= 0),

                          CONSTRAINT products_old_price_non_negative
                              CHECK (old_price IS NULL OR old_price >= 0)
);

CREATE INDEX idx_products_store_id
    ON products(store_id);

CREATE INDEX idx_products_category_id
    ON products(category_id);

CREATE INDEX idx_products_store_category
    ON products(store_id, category_id);

CREATE INDEX idx_products_status
    ON products(status);

CREATE INDEX idx_products_store_status
    ON products(store_id, status);

CREATE UNIQUE INDEX uq_products_store_slug
    ON products(store_id, lower(slug));

CREATE UNIQUE INDEX uq_products_store_sku
    ON products(store_id, lower(sku))
    WHERE sku IS NOT NULL;


CREATE TABLE product_attributes (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
                                    category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,

                                    name VARCHAR(255) NOT NULL,
                                    code VARCHAR(100) NOT NULL,

                                    is_required BOOLEAN NOT NULL DEFAULT FALSE,
                                    is_filter BOOLEAN NOT NULL DEFAULT FALSE,

                                    type attribute_type NOT NULL,

                                    unit VARCHAR(50),

                                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                                    CONSTRAINT product_attributes_name_not_empty
                                        CHECK (trim(name) <> ''),

                                    CONSTRAINT product_attributes_code_not_empty
                                        CHECK (trim(code) <> '')
);

CREATE INDEX idx_product_attributes_store_id
    ON product_attributes(store_id);

CREATE INDEX idx_product_attributes_category_id
    ON product_attributes(category_id);

CREATE INDEX idx_product_attributes_store_category
    ON product_attributes(store_id, category_id);

CREATE INDEX idx_product_attributes_store_filter
    ON product_attributes(store_id, is_filter);

CREATE UNIQUE INDEX uq_product_attributes_store_category_code
    ON product_attributes (
                           store_id,
                           COALESCE(category_id, '00000000-0000-0000-0000-000000000000'::uuid),
                           lower(code)
        );


CREATE TABLE product_attribute_options (
                                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                           product_attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,

                                           value VARCHAR(255) NOT NULL,
                                           position INT NOT NULL DEFAULT 0,

                                           created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                           updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                                           CONSTRAINT product_attribute_options_value_not_empty
                                               CHECK (trim(value) <> '')
);

CREATE INDEX idx_product_attribute_options_attribute_id
    ON product_attribute_options(product_attribute_id);

CREATE INDEX idx_product_attribute_options_attribute_position
    ON product_attribute_options(product_attribute_id, position);

CREATE UNIQUE INDEX uq_product_attribute_options_attribute_value
    ON product_attribute_options(product_attribute_id, lower(value));


CREATE TABLE product_attribute_values (
                                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                                          product_attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,

                                          value_text TEXT,
                                          value_number DOUBLE PRECISION,
                                          value_bool BOOLEAN,
                                          option_id UUID REFERENCES product_attribute_options(id) ON DELETE SET NULL,

                                          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                                          CONSTRAINT product_attribute_values_one_value_only
                                              CHECK (num_nonnulls(value_text, value_number, value_bool, option_id) = 1)
);

CREATE INDEX idx_product_attribute_values_product_id
    ON product_attribute_values(product_id);

CREATE INDEX idx_product_attribute_values_attribute_id
    ON product_attribute_values(product_attribute_id);

CREATE INDEX idx_product_attribute_values_option_id
    ON product_attribute_values(option_id);

CREATE UNIQUE INDEX uq_product_attribute_values_product_attribute
    ON product_attribute_values(product_id, product_attribute_id);

-- +goose StatementEnd


-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS product_attribute_values;
DROP TABLE IF EXISTS product_attribute_options;
DROP TABLE IF EXISTS product_attributes;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_categories;

DROP TYPE IF EXISTS attribute_type;
DROP TYPE IF EXISTS product_status;

-- +goose StatementEnd