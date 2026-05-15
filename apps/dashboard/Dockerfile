# Build context is the repo ROOT (see docker-compose.yml).
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
# Nx builds the dashboard's dependency graph (models-ts, ui, common-ts) first.
RUN pnpm exec nx build dashboard

# next.config.mjs sets output: "standalone", so the runtime image is slim.
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo/apps/dashboard/.next/standalone ./
COPY --from=build /repo/apps/dashboard/.next/static ./apps/dashboard/.next/static
EXPOSE 3000
CMD ["node", "apps/dashboard/server.js"]
