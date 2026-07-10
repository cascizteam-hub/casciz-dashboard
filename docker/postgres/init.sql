-- ─────────────────────────────────────────────────────────────────────────────
-- Casciz Commerce OS – PostgreSQL Initialisation
-- Runs once when the container is first created.
-- Flyway handles all subsequent migrations.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Ensure the application user has the right privileges
-- (user already created by POSTGRES_USER env var)
GRANT ALL PRIVILEGES ON DATABASE casciz_commerce TO casciz_user;

-- Set default timezone
ALTER DATABASE casciz_commerce SET timezone TO 'UTC';
