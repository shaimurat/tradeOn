-- +goose Up
-- +goose StatementBegin
CREATE TABLE stores (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                        name VARCHAR(255) NOT NULL,
                        description TEXT NOT NULL DEFAULT '',
                        slug VARCHAR(255) NOT NULL UNIQUE,

                        seller_id UUID NOT NULL,

                        logo_url TEXT,
                        banner_url TEXT,

                        phone VARCHAR(50),
                        email VARCHAR(255),
                        address TEXT,

                        status VARCHAR(50) NOT NULL DEFAULT 'moderation',

                        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                        CONSTRAINT fk_stores_seller
                            FOREIGN KEY (seller_id)
                                REFERENCES users(id)
                                ON DELETE CASCADE,

                        CONSTRAINT stores_status_check
                            CHECK (status IN ('active', 'inactive', 'blocked', 'moderation'))
);

CREATE INDEX idx_stores_seller_id ON stores(seller_id);
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_created_at ON stores(created_at DESC);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS stores;
-- +goose StatementEnd