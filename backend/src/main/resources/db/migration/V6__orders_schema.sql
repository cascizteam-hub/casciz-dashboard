-- ─────────────────────────────────────────────────────────────────────────────
-- V6__orders_schema.sql
-- Orders, order items, and order timeline notes.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Order number sequence (store-agnostic sequential numbers) ─────────────────
CREATE SEQUENCE IF NOT EXISTS order_number_seq
    START WITH 1001 INCREMENT BY 1 NO CYCLE;

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE orders (
    id                     UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id               UUID           NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    checkout_id            UUID           NOT NULL UNIQUE REFERENCES checkouts(id) ON DELETE RESTRICT,
    order_number           VARCHAR(20)    NOT NULL UNIQUE,

    status                 VARCHAR(30)    NOT NULL DEFAULT 'PENDING_PAYMENT'
                                          CHECK (status IN ('PENDING_PAYMENT','PAID','PROCESSING',
                                                            'SHIPPED','DELIVERED','CANCELLED',
                                                            'REFUNDED','PARTIALLY_REFUNDED')),
    fulfilment_status      VARCHAR(30)    NOT NULL DEFAULT 'UNFULFILLED'
                                          CHECK (fulfilment_status IN ('UNFULFILLED','PARTIAL',
                                                                       'READY_TO_SHIP','SHIPPED',
                                                                       'DELIVERED','RETURNED')),
    -- Customer snapshot
    customer_email         VARCHAR(255)   NOT NULL,
    customer_first_name    VARCHAR(100),
    customer_last_name     VARCHAR(100),
    customer_phone         VARCHAR(30),
    customer_notes         TEXT,

    -- Shipping address
    shipping_full_name     VARCHAR(120),
    shipping_line1         VARCHAR(255),
    shipping_line2         VARCHAR(255),
    shipping_city          VARCHAR(100),
    shipping_state         VARCHAR(100),
    shipping_postal_code   VARCHAR(20),
    shipping_country_code  CHAR(2),
    shipping_phone         VARCHAR(30),

    -- Billing address
    billing_full_name      VARCHAR(120),
    billing_line1          VARCHAR(255),
    billing_line2          VARCHAR(255),
    billing_city           VARCHAR(100),
    billing_state          VARCHAR(100),
    billing_postal_code    VARCHAR(20),
    billing_country_code   CHAR(2),
    billing_phone          VARCHAR(30),

    -- Pricing snapshot
    subtotal               NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    shipping_amount        NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    tax_amount             NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    discount_amount        NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    total_amount           NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    refunded_amount        NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    currency               VARCHAR(10)    NOT NULL DEFAULT 'USD',
    coupon_code            VARCHAR(50),

    -- Payment
    payment_provider       VARCHAR(30),
    payment_reference      VARCHAR(255),

    -- Fulfilment / shipping
    tracking_number        VARCHAR(120),
    carrier_name           VARCHAR(80),
    tracking_url           VARCHAR(512),
    shipped_at             TIMESTAMPTZ,
    delivered_at           TIMESTAMPTZ,
    estimated_delivery_at  TIMESTAMPTZ,

    -- Timestamps
    created_at             TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    cancelled_at           TIMESTAMPTZ,
    cancellation_reason    VARCHAR(255)
);

CREATE INDEX idx_orders_store_id      ON orders (store_id);
CREATE INDEX idx_orders_status        ON orders (status);
CREATE INDEX idx_orders_fulfilment    ON orders (fulfilment_status);
CREATE INDEX idx_orders_customer      ON orders (customer_email);
CREATE INDEX idx_orders_created_at    ON orders (created_at DESC);
CREATE INDEX idx_orders_order_number  ON orders (order_number);
CREATE INDEX idx_orders_checkout_id   ON orders (checkout_id);

-- Full-text search on customer name/email and order number
CREATE INDEX idx_orders_search ON orders
    USING GIN (to_tsvector('english',
        order_number || ' ' || customer_email || ' '
        || COALESCE(customer_first_name,'') || ' '
        || COALESCE(customer_last_name,'')));

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Order Items ───────────────────────────────────────────────────────────────
CREATE TABLE order_items (
    id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id          UUID           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id        UUID           NOT NULL,
    variant_id        UUID           NOT NULL,
    product_name      VARCHAR(255)   NOT NULL,
    variant_title     VARCHAR(255)   NOT NULL,
    sku               VARCHAR(100),
    unit_price        NUMERIC(19,2)  NOT NULL,
    quantity          INT            NOT NULL CHECK (quantity > 0),
    refunded_quantity INT            NOT NULL DEFAULT 0,
    image_url         VARCHAR(512)
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);

-- ── Order Notes (timeline) ────────────────────────────────────────────────────
CREATE TABLE order_notes (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    body                TEXT         NOT NULL,
    is_system           BOOLEAN      NOT NULL DEFAULT FALSE,
    visible_to_customer BOOLEAN      NOT NULL DEFAULT FALSE,
    author              VARCHAR(120),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_notes_order_id ON order_notes (order_id);
