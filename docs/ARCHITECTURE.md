# Architecture Decision Records

This directory documents significant architectural decisions for Casciz Commerce OS.

## ADR-001: Clean Architecture

**Date:** 2025-01-01  
**Status:** Accepted

### Context
We need a backend architecture that is testable, maintainable, and framework-agnostic at its core.

### Decision
Adopt Clean Architecture with four explicit layers:
- **Domain** — pure business entities and repository interfaces; zero framework dependencies
- **Application** — use-cases that orchestrate domain objects; no HTTP awareness
- **Infrastructure** — implements domain repository interfaces using JPA/Redis/etc.
- **Presentation** — Spring MVC controllers; thin layer that delegates to application use-cases

### Enforcement
ArchUnit tests in `ArchitectureTest.java` fail the build if any layer violates the dependency rule.

---

## ADR-002: JWT with Refresh Token Rotation

**Date:** 2025-01-01  
**Status:** Accepted

### Context
We need stateless authentication that supports long-lived sessions without sacrificing security.

### Decision
- Short-lived access tokens (15 min) — stateless JWT, validated by the filter on every request
- Long-lived refresh tokens (7 days) — stored hashed in PostgreSQL with full audit trail
- Rotation: every refresh call issues a new refresh token and revokes the old one
- Replay detection: presenting a revoked token triggers revocation of ALL sessions for that user

### Rationale
Storing refresh tokens in the database (rather than Redis only) provides a durable audit trail and enables instant revocation of all sessions without TTL delays.

---

## ADR-003: Flyway for Database Migrations

**Date:** 2025-01-01  
**Status:** Accepted

### Decision
Use Flyway with versioned SQL scripts (not JPA `ddl-auto: create`). Production runs `validate` only — Flyway applies the actual migrations.

### Rationale
Pure SQL migrations are portable, reviewable in PRs, and don't risk data loss from ORM schema generation.
