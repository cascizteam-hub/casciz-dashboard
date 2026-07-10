-- ─────────────────────────────────────────────────────────────────────────────
-- V4__products_schema.sql
-- Creates product_categories, products, product_variants, product_images tables.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Product Categories ────────────────────────────────────────────────────────
CREATE TABLE product_categories (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name        VARCHAR(120) NOT NULL,
    slug        VARCHAR(80)  NOT NULL,
    description VARCHAR(500),
    image_url   VARCHAR(512),
    sort_order  INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_category_slug_per_store UNIQUE (store_id, slug)
);

CREATE INDEX idx_product_categories_store_id ON product_categories (store_id);

CREATE TRIGGER trg_product_categories_updated_at
    BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Products ──────────────────────────────────────────────────────────────────
CREATE TABLE products (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id          UUID         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name              VARCHAR(255) NOT NULL,
    slug              VARCHAR(120) NOT NULL,
    description       TEXT,
    short_description VARCHAR(500),
    status            VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                                   CHECK (status IN ('DRAFT','ACTIVE','ARCHIVED')),
    category_id       UUID         REFERENCES product_categories(id) ON DELETE SET NULL,
    tags              VARCHAR(500),
    meta_title        VARCHAR(150),
    meta_description  VARCHAR(300),
    is_digital        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_slug_per_store UNIQUE (store_id, slug)
);

CREATE INDEX idx_products_store_id    ON products (store_id);
CREATE INDEX idx_products_status      ON products (status);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_created_at  ON products (created_at DESC);

-- Full-text search index
CREATE INDEX idx_products_search ON products
    USING GIN (to_tsvector('english',
        name || ' ' || COALESCE(short_description, '') || ' ' || COALESCE(tags, '')));

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Product Variants ──────────────────────────────────────────────────────────
CREATE TABLE product_variants (
    id                 UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id         UUID           NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title              VARCHAR(255)   NOT NULL DEFAULT 'Default',
    sku                VARCHAR(100)   UNIQUE,
    price              NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    compare_at_price   NUMERIC(19,2),
    cost_price         NUMERIC(19,2),
    inventory_quantity INT,               -- NULL = unlimited/untracked
    allow_backorder    BOOLEAN        NOT NULL DEFAULT FALSE,
    weight_grams       INT,
    sort_order         INT            NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_variants_product_id ON product_variants (product_id);
CREATE INDEX idx_product_variants_sku        ON product_variants (sku) WHERE sku IS NOT NULL;

-- ── Product Images ────────────────────────────────────────────────────────────
CREATE TABLE product_images (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url        VARCHAR(512) NOT NULL,
    alt_text   VARCHAR(255),
    sort_order INT          NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_images_product_id ON product_images (product_id);
