# Build context is the repo ROOT (see docker-compose.yml).
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
# Only the workspace manifests + the dashboard and the TS libs it depends on.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY libs/common-ts ./libs/common-ts
COPY libs/models-ts ./libs/models-ts
COPY libs/ui ./libs/ui
COPY apps/dashboard ./apps/dashboard
RUN pnpm install --frozen-lockfile
# Build the dashboard's workspace TS dependencies (tsc) then the dashboard
# itself (next build), in dependency order. `pnpm --filter dashboard...`
# selects the dashboard plus its dependencies — replaces the former
# `nx build dashboard` (Nx only exists on the main branch).
RUN pnpm --filter dashboard... build

# next.config.mjs sets output: "standalone", so the runtime image is slim.
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo/apps/dashboard/.next/standalone ./
COPY --from=build /repo/apps/dashboard/.next/static ./apps/dashboard/.next/static
EXPOSE 3000
CMD ["node", "apps/dashboard/server.js"]
