-- ─────────────────────────────────────────────────────────────────────────────
-- V3__pages_schema.sql
-- Creates the store_pages table with JSONB content storage.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE store_pages (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id         UUID         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    title            VARCHAR(150) NOT NULL,
    slug             VARCHAR(80)  NOT NULL DEFAULT '',
    meta_title       VARCHAR(150),
    meta_description VARCHAR(300),
    type             VARCHAR(20)  NOT NULL DEFAULT 'CUSTOM'
                                  CHECK (type IN ('HOME','ABOUT','CONTACT','CATALOG','CUSTOM')),
    status           VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                                  CHECK (status IN ('DRAFT','PUBLISHED')),
    sort_order       INT          NOT NULL DEFAULT 0,
    content          JSONB        NOT NULL DEFAULT '{"blocks":[],"theme":{}}',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    published_at     TIMESTAMPTZ,

    -- A store can only have one HOME page
    CONSTRAINT uq_store_home_page UNIQUE (store_id, type) DEFERRABLE INITIALLY DEFERRED,
    -- Slug must be unique within a store (empty string allowed for HOME)
    CONSTRAINT uq_store_page_slug UNIQUE (store_id, slug)
);

-- The UNIQUE constraint above handles HOME uniqueness; drop the partial index approach
-- and rely on the application-level check for clarity.

CREATE INDEX idx_store_pages_store_id     ON store_pages (store_id);
CREATE INDEX idx_store_pages_status       ON store_pages (status);
CREATE INDEX idx_store_pages_sort_order   ON store_pages (store_id, sort_order);

-- GIN index for fast JSONB content queries (future search features)
CREATE INDEX idx_store_pages_content_gin  ON store_pages USING GIN (content);

-- Auto-update updated_at
CREATE TRIGGER trg_store_pages_updated_at
    BEFORE UPDATE ON store_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
