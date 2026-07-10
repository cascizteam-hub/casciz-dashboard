-- ─────────────────────────────────────────────────────────────────────────────
-- V2__stores_schema.sql
-- Creates the stores table and supporting indexes.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE stores (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(150)  NOT NULL,
    slug           VARCHAR(80)   NOT NULL UNIQUE,
    description    TEXT,
    logo_url       VARCHAR(512),
    favicon_url    VARCHAR(512),
    custom_domain  VARCHAR(255)  UNIQUE,
    status         VARCHAR(20)   NOT NULL DEFAULT 'DRAFT'
                                 CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    currency       VARCHAR(10)   NOT NULL DEFAULT 'USD',
    timezone       VARCHAR(60)   NOT NULL DEFAULT 'UTC',
    contact_email  VARCHAR(255),
    contact_phone  VARCHAR(30),
    owner_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    published_at   TIMESTAMPTZ,
    archived_at    TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_stores_owner_id  ON stores (owner_id);
CREATE INDEX idx_stores_status    ON stores (status);
CREATE INDEX idx_stores_slug      ON stores (slug);
CREATE INDEX idx_stores_created_at ON stores (created_at DESC);

-- GIN index for fast text search on name + description
CREATE INDEX idx_stores_search ON stores
    USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Auto-update updated_at trigger (reuses function from V1)
CREATE TRIGGER trg_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
