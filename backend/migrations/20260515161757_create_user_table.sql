-- +goose Up
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                       role TEXT NOT NULL DEFAULT 'client',
                       email TEXT NOT NULL UNIQUE,
                       username TEXT NOT NULL UNIQUE,
                       password_hash TEXT,

                       avatar_url TEXT,
                       auth_method TEXT NOT NULL DEFAULT 'email',

                       created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                       updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                       last_login TIMESTAMPTZ,

                       status TEXT NOT NULL DEFAULT 'active',

                       CONSTRAINT users_role_check CHECK (
                           role IN ('admin', 'seller', 'client')
                           ),

                       CONSTRAINT users_auth_method_check CHECK (
                           auth_method IN ('email', 'google')
                           ),

                       CONSTRAINT users_status_check CHECK (
                           status IN ('blocked', 'active', 'inactive')
                           ),

                       CONSTRAINT users_email_password_check CHECK (
                           auth_method != 'email'
                           OR password_hash IS NOT NULL
)
    );

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_auth_method ON users(auth_method);
CREATE INDEX idx_users_created_at ON users(created_at);

-- +goose Down
DROP TABLE IF EXISTS users;