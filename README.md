# Casciz Commerce OS

> Enterprise SaaS platform — drag-and-drop no-code online store builder.

[![CI](https://github.com/your-org/casciz-commerce-os/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/casciz-commerce-os/actions/workflows/ci.yml)

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Troubleshooting](#troubleshooting)
- [API Documentation](#api-documentation)
- [Authentication Flow](#authentication-flow)
- [Role System](#role-system)
- [Database Migrations](#database-migrations)
- [Testing](#testing)
- [Milestone Roadmap](#milestone-roadmap)

---

## Architecture

Casciz Commerce OS uses **Clean Architecture** on both frontend and backend.

```
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Java 21 / Spring Boot 3)        │
│                                                                   │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│  │ Presentation │→ │   Application   │→ │      Domain       │  │
│  │ (Controllers)│  │  (Use-Cases)    │  │  (Entities/Repos) │  │
│  └──────────────┘  └─────────────────┘  └───────────────────┘  │
│           ↑                                        ↑             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Infrastructure (JPA, Redis, JWT, Mail)      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js 15 / React 19)               │
│                                                                   │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │   Pages    │→ │    Hooks     │→ │   API Layer (axios)  │    │
│  │ (App Router│  │  (useAuth,  │  │  (auth.api, user.api)│    │
│  │  layouts)  │  │   useStore) │  └──────────────────────┘    │
│  └────────────┘  └──────────────┘                               │
│                         ↓                                        │
│                  ┌──────────────┐                               │
│                  │  Zustand     │                               │
│                  │  Stores      │                               │
│                  └──────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Rule
The dependency arrow always points **inward**. Domain has zero framework dependencies. Application depends only on Domain. Infrastructure implements Domain interfaces. Presentation depends on Application.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 15, React 19, TypeScript    |
| Styling     | Tailwind CSS (custom design system) |
| State       | Zustand                             |
| Forms       | React Hook Form + Zod               |
| HTTP Client | Axios (with silent token refresh)   |
| Backend     | Java 21, Spring Boot 3.3            |
| Security    | Spring Security, JWT (JJWT / HS512) |
| Database    | PostgreSQL 16                       |
| Migrations  | Flyway                              |
| Cache/Queue | Redis 7                             |
| Proxy       | Nginx 1.25                          |
| Container   | Docker + Docker Compose             |
| CI/CD       | GitHub Actions                      |

---

## Project Structure

```
casciz-commerce-os/
├── .github/workflows/       # CI/CD pipelines
├── backend/                 # Spring Boot application
│   └── src/main/java/com/casciz/commerceos/
│       ├── domain/          # Entities, repository interfaces (framework-free)
│       ├── application/     # Use-cases, DTOs
│       ├── infrastructure/  # JPA, Redis, JWT, security filters
│       ├── presentation/    # REST controllers
│       └── shared/          # Exceptions, response envelope, utilities
├── frontend/                # Next.js application
│   └── src/
│       ├── app/             # App Router pages & layouts
│       ├── components/      # React components
│       ├── hooks/           # Custom hooks
│       ├── lib/             # API clients, validators, utilities
│       ├── store/           # Zustand state stores
│       ├── types/           # Global TypeScript types
│       └── config/          # App-wide configuration constants
├── docker/                  # Nginx config, Postgres init scripts
├── docs/                    # Architecture decision records
├── docker-compose.yml       # Production compose
├── docker-compose.dev.yml   # Development overrides
└── .env.example             # Environment variable documentation
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose v2.20+
- Node.js 22+ (for local frontend dev)
- Java 21+ (for local backend dev)
- Maven 3.9+

### First-time setup

The fastest path — clones aside, this is all you need:

```bash
bash start.sh
```

This creates `.env` from `.env.example` if missing (it already ships with
working dev defaults, no values to fill in) and brings up the full stack.
See [`HOW-TO-RUN.md`](HOW-TO-RUN.md) for the manual step-by-step version.

```bash
# 1. Clone the repository
git clone https://github.com/your-org/casciz-commerce-os.git
cd casciz-commerce-os

# 2. Create your environment file (optional — defaults work out of the box)
cp .env.example .env

# 3. Start all services
docker compose up -d

# 4. The app is now available at:
#    Frontend  → http://localhost:80
#    API       → http://localhost:80/api/v1
#    Swagger   → http://localhost:8080/swagger-ui.html  (dev profile only)
```

---

## Environment Variables

All required variables are documented in [`.env.example`](.env.example).

Critical variables to change before running in any environment:

| Variable            | Description                                     |
|---------------------|-------------------------------------------------|
| `JWT_SECRET`        | ≥ 64 characters; generate with `openssl rand -base64 64` |
| `POSTGRES_PASSWORD` | Strong database password                        |
| `REDIS_PASSWORD`    | Redis authentication password                   |
| `NEXTAUTH_SECRET`   | ≥ 32 characters random string                   |

---

## Running the Project

### Full stack (Docker)

```bash
# Start all services (production mode)
docker compose up -d

# Start in development mode (hot reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose down
```

### Backend only (local Maven)

```bash
cd backend
cp src/main/resources/application.yml src/main/resources/application-local.yml
# Edit application-local.yml with your local Postgres/Redis details

mvn spring-boot:run -Dspring-boot.run.profiles=development
```

### Frontend only (local Node)

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local

npm install
npm run dev
# Available at http://localhost:3000
```

---

## Troubleshooting

### `backend` fails with `FATAL: password authentication failed for user "casciz_user"`

You'll see this as a Flyway/HikariCP `PSQLException` in the `casciz-backend` logs,
followed by Compose reporting:

```
dependency failed to start: container casciz-backend is unhealthy
```

Postgres only reads `POSTGRES_USER` / `POSTGRES_PASSWORD` **the first time** it
initializes an empty `postgres-data` volume. If the volume already exists from
an earlier run, changing `POSTGRES_PASSWORD` in `.env` afterwards has no effect
on the database — it keeps the original password, while `backend` picks up the
new one and gets rejected. This happens most often when you edit
`POSTGRES_PASSWORD` after already running `docker compose up` once, or when
you're reusing a `postgres-data` volume from a different `.env`.

**Fix — make the volume match `.env`:**

```bash
docker compose down
docker volume rm casciz_postgres-data   # drop the stale volume (destroys local DB data)
docker compose up -d                    # postgres re-initializes with current .env values
```

To keep existing data instead, reset the password inside Postgres to match `.env`:

```bash
docker compose exec postgres psql -U postgres -c \
  "ALTER USER casciz_user WITH PASSWORD '<value of POSTGRES_PASSWORD in .env>';"
docker compose restart backend
```

### `next build` / Docker frontend build fails with lint or type errors

Next.js treats ESLint errors and TypeScript errors as build failures during
`next build` (used by the frontend's production Docker stage), not just
warnings. If you add new components, run `npm run build` locally in
`frontend/` before rebuilding the Docker image so you catch these early
instead of 10 minutes into `docker compose up --build`.

### Backend fails to start with a YAML parsing / duplicate key error

If `backend/src/main/resources/application.yml` ever ends up with two
top-level `spring:` blocks (e.g. after a manual merge), Spring's YAML loader
throws `found duplicate key spring` and the app won't start. Keep all
`spring.*` settings under the single `spring:` block at the top of the file.

---

## API Documentation

When running with the `development` profile, Swagger UI is available at:

```
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON spec:

```
http://localhost:8080/api-docs
```

### Authentication Endpoints

| Method | Path                              | Description                      |
|--------|-----------------------------------|----------------------------------|
| POST   | `/api/v1/auth/register`           | Create new account               |
| POST   | `/api/v1/auth/verify-email`       | Verify email with token          |
| POST   | `/api/v1/auth/login`              | Sign in, receive token pair      |
| POST   | `/api/v1/auth/refresh`            | Refresh access token             |
| POST   | `/api/v1/auth/logout`             | Revoke refresh token             |
| POST   | `/api/v1/auth/forgot-password`    | Request password reset email     |
| POST   | `/api/v1/auth/reset-password`     | Set new password with token      |

### Store Endpoints (authenticated)

| Method | Path                              | Description                              |
|--------|-----------------------------------|------------------------------------------|
| POST   | `/api/v1/stores`                  | Create a new store                       |
| GET    | `/api/v1/stores`                  | List stores (paginated, searchable)      |
| GET    | `/api/v1/stores/stats`            | Aggregate store counts for dashboard     |
| GET    | `/api/v1/stores/slug/check`       | Check slug availability                  |
| GET    | `/api/v1/stores/{id}`             | Get a single store                       |
| PUT    | `/api/v1/stores/{id}`             | Update store settings                    |
| PATCH  | `/api/v1/stores/{id}/status`      | Publish / un-publish / archive           |
| DELETE | `/api/v1/stores/{id}`             | Delete a draft or archived store         |

### User Endpoints (authenticated)

| Method | Path                  | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/v1/users/me`    | Get current user profile |
| PATCH  | `/api/v1/users/me`    | Update profile           |
| PUT    | `/api/v1/users/me/password` | Change password    |

---

## Authentication Flow

```
Client                          Backend
  │                                │
  │  POST /auth/register           │
  │──────────────────────────────→ │  Create user, send verification email
  │                                │
  │  POST /auth/verify-email       │
  │──────────────────────────────→ │  Mark email verified
  │                                │
  │  POST /auth/login              │
  │──────────────────────────────→ │  Returns { accessToken, refreshToken }
  │                                │
  │  GET /api/v1/... (with Bearer) │
  │──────────────────────────────→ │  JwtAuthenticationFilter validates token
  │                                │
  │  (access token expires)        │
  │  POST /auth/refresh            │
  │──────────────────────────────→ │  Rotate refresh token, issue new pair
```

**Token storage:** Access token and refresh token are stored in `httpOnly`-equivalent cookies (Secure, SameSite=Strict). Tokens are never stored in `localStorage`.

**Token rotation:** Every refresh issues a new refresh token. If an already-used refresh token is presented (replay attack), all sessions for that user are immediately revoked.

---

## Role System

| Role              | Description                                  |
|-------------------|----------------------------------------------|
| `ROLE_SUPER_ADMIN` | Internal Casciz staff — full system access  |
| `ROLE_OWNER`       | Created the workspace, all tenant rights    |
| `ROLE_ADMIN`       | Delegated admin within the workspace        |
| `ROLE_MEMBER`      | Can manage stores (default on registration) |
| `ROLE_VIEWER`      | Read-only access to dashboards              |

Roles are seeded in `V1__initial_schema.sql` and are not modifiable at runtime.

---

## Database Migrations

Flyway manages all schema changes. Migration files live in:

```
backend/src/main/resources/db/migration/
```

Naming convention: `V{version}__{description}.sql`

```bash
# Run migrations manually (from backend directory)
mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/casciz_commerce \
    -Dflyway.user=casciz_user -Dflyway.password=your_password
```

---

## Testing

### Backend

```bash
cd backend
mvn test                          # Unit + integration tests
mvn test -pl . -Dtest=AuthServiceTest  # Single test class
```

Tests include:
- Unit tests for use-cases (Mockito)
- Architecture boundary tests (ArchUnit)
- Integration tests with Testcontainers (PostgreSQL)

### Frontend

```bash
cd frontend
npm test                          # All tests
npm run test:watch                # Watch mode
npm run test:coverage             # Coverage report
```

---

## Milestone Roadmap

| Milestone | Status  | Description                                          |
|-----------|---------|------------------------------------------------------|
| 1         | ✅ Done | Project foundation, auth, JWT, roles, Docker         |
| 2         | ✅ Done | Store management — create, configure, publish stores |
| 3         | ✅ Done | Drag-and-drop page builder                           |
| 4         | ✅ Done | Product catalogue & inventory                        |
| 5         | ✅ Done | Checkout & payment processing                        |
| 6         | ✅ Done | Orders & fulfilment                        |
| 4         | 📋 Planned | Product catalogue & inventory                     |
| 6         | 📋 Planned | Orders & fulfilment                               |
| 7         | 📋 Planned | Analytics & reporting                             |
| 8         | 📋 Planned | Team management & permissions                     |
| 9         | 📋 Planned | Billing & subscription management                 |
| 10        | 📋 Planned | Multi-tenant custom domains & SSL                 |

---

## Contributing

1. Branch from `develop` following `feature/`, `fix/`, `chore/` prefixes.
2. Every PR must pass the full CI suite before merging.
3. All new features must include unit tests.
4. Architecture boundary tests (`ArchitectureTest.java`) must remain green.

---

## License

Proprietary — © 2025 Casciz Technologies. All rights reserved.
