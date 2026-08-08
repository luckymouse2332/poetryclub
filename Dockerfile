# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=production_env,required=true \
    set -a && \
    . /run/secrets/production_env && \
    set +a && \
    pnpm build

FROM base AS migrator
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml drizzle.config.ts tsconfig.json ./
COPY drizzle ./drizzle
COPY src/server/db/schema ./src/server/db/schema
COPY src/server/validation/env.ts ./src/server/validation/env.ts
COPY scripts/bootstrap-admin.mjs ./scripts/bootstrap-admin.mjs
COPY scripts/reset-user-password.mjs ./scripts/reset-user-password.mjs
COPY src/lib/password-policy.mjs ./src/lib/password-policy.mjs
USER node
CMD ["node", "node_modules/drizzle-kit/bin.cjs", "migrate"]

FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
