# ─────────────────────────────────────────────────────────────────────────────
# Casciz Commerce OS – Frontend Dockerfile (multi-stage)
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# ── Stage 2: Development ──────────────────────────────────────────────────────
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# ── Stage 3: Build ────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ── Stage 4: Production ───────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

RUN addgroup -S casciz && adduser -S casciz -G casciz

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=builder --chown=casciz:casciz /app/public          ./public
COPY --from=builder --chown=casciz:casciz /app/.next/standalone ./
COPY --from=builder --chown=casciz:casciz /app/.next/static     ./.next/static

USER casciz

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
