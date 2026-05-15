# dashboard (Next.js + React)

The greenhouse monitoring frontend. App Router, React Server Components,
talks to the Go `api-gateway` over GraphQL.

## Dependency graph

- `@greenhouse/models` — domain types (generated from proto)
- `@greenhouse/ui` — shared React components (`SensorCard`)
- `@greenhouse/common` — shared TS utilities
- `graphql-schema` — implicit dependency; `codegen.ts` generates a typed
  client from it

Nx infers the first three edges from imports. A change to any of them — or
to the GraphQL schema, or (transitively) to a `.proto` file — marks the
dashboard affected in CI.

```bash
nx codegen dashboard   # graphql-codegen -> lib/gql
nx serve dashboard     # next dev on :3000
nx build dashboard
```
