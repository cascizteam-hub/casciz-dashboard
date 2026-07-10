-- ─────────────────────────────────────────────────────────────────────────────
-- V5__checkout_payment_schema.sql
-- Checkout sessions, line items, payment transactions, payment settings.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Checkouts ─────────────────────────────────────────────────────────────────
CREATE TABLE checkouts (
    id                     UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id               UUID           NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    session_token          VARCHAR(64)    NOT NULL UNIQUE,
    status                 VARCHAR(20)    NOT NULL DEFAULT 'OPEN'
                                          CHECK (status IN ('OPEN','PROCESSING','COMPLETED','ABANDONED','FAILED')),

    -- Customer info
    customer_email         VARCHAR(255),
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

    -- Totals
    subtotal               NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    shipping_amount        NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    tax_amount             NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    discount_amount        NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    total_amount           NUMERIC(19,2)  NOT NULL DEFAULT 0.00,
    currency               VARCHAR(10)    NOT NULL DEFAULT 'USD',
    coupon_code            VARCHAR(50),

    -- Payment
    payment_intent_id      VARCHAR(255),
    payment_provider       VARCHAR(30),

    -- Timestamps
    created_at             TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    completed_at           TIMESTAMPTZ,
    expires_at             TIMESTAMPTZ    NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_checkouts_store_id       ON checkouts (store_id);
CREATE INDEX idx_checkouts_status         ON checkouts (status);
CREATE INDEX idx_checkouts_customer_email ON checkouts (customer_email);
CREATE INDEX idx_checkouts_session_token  ON checkouts (session_token);
CREATE INDEX idx_checkouts_created_at     ON checkouts (created_at DESC);
CREATE INDEX idx_checkouts_payment_intent ON checkouts (payment_intent_id)
    WHERE payment_intent_id IS NOT NULL;

CREATE TRIGGER trg_checkouts_updated_at
    BEFORE UPDATE ON checkouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Checkout Items ────────────────────────────────────────────────────────────
CREATE TABLE checkout_items (
    id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_id    UUID           NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
    product_id     UUID           NOT NULL,
    variant_id     UUID           NOT NULL,
    product_name   VARCHAR(255)   NOT NULL,
    variant_title  VARCHAR(255)   NOT NULL,
    sku            VARCHAR(100),
    unit_price     NUMERIC(19,2)  NOT NULL,
    quantity       INT            NOT NULL CHECK (quantity > 0),
    image_url      VARCHAR(512)
);

CREATE INDEX idx_checkout_items_checkout_id ON checkout_items (checkout_id);

-- ── Payment Transactions ──────────────────────────────────────────────────────
CREATE TABLE payment_transactions (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_id           UUID          NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
    provider              VARCHAR(30)   NOT NULL,
    status                VARCHAR(30)   NOT NULL DEFAULT 'PENDING'
                                        CHECK (status IN ('PENDING','PROCESSING','SUCCEEDED',
                                                          'FAILED','REFUNDED','PARTIALLY_REFUNDED','CANCELLED')),
    provider_reference    VARCHAR(255),
    payment_intent_id     VARCHAR(255),
    amount                NUMERIC(19,2) NOT NULL,
    currency              VARCHAR(10)   NOT NULL,
    payment_method_brand  VARCHAR(50),
    payment_method_last4  CHAR(4),
    gateway_response      TEXT,
    failure_reason        VARCHAR(500),
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_txn_checkout_id  ON payment_transactions (checkout_id);
CREATE INDEX idx_payment_txn_provider_ref ON payment_transactions (provider_reference)
    WHERE provider_reference IS NOT NULL;
CREATE INDEX idx_payment_txn_status       ON payment_transactions (status);

-- ── Store Payment Settings ────────────────────────────────────────────────────
CREATE TABLE store_payment_settings (
    id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id                 UUID         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    provider                 VARCHAR(30)  NOT NULL,
    enabled                  BOOLEAN      NOT NULL DEFAULT FALSE,
    public_key               VARCHAR(512),
    secret_key_encrypted     VARCHAR(512),   -- AES-256-GCM encrypted
    webhook_secret_encrypted VARCHAR(512),   -- AES-256-GCM encrypted
    live_mode                BOOLEAN      NOT NULL DEFAULT FALSE,
    display_name             VARCHAR(100),
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_payment_settings_store_provider UNIQUE (store_id, provider)
);

CREATE INDEX idx_payment_settings_store_id ON store_payment_settings (store_id);

CREATE TRIGGER trg_payment_settings_updated_at
    BEFORE UPDATE ON store_payment_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
