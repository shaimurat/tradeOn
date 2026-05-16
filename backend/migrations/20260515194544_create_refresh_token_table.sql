-- +goose Up
-- +goose StatementBegin

CREATE TABLE refresh_tokens (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                refresh_token_hash TEXT NOT NULL UNIQUE,

                                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

                                user_agent TEXT NOT NULL DEFAULT '',
                                ip_address TEXT NOT NULL DEFAULT '',
                                user_device TEXT NOT NULL DEFAULT '',

                                revoked_at TIMESTAMPTZ NULL,

                                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_refresh_tokens_user_id
    ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_tokens_expires_at
    ON refresh_tokens(expires_at);

CREATE INDEX idx_refresh_tokens_user_id_revoked_at
    ON refresh_tokens(user_id, revoked_at);

-- +goose StatementEnd


-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS refresh_tokens;

-- +goose StatementEnd