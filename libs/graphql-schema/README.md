# graphql-schema — public GraphQL API contract

`schema.graphql` is the schema-first contract for the public API. It is
consumed by two projects:

- **api-gateway** (Go) — runs `gqlgen` against it to generate resolver
  interfaces and models. Declared as an implicit dependency, so editing the
  schema marks the gateway affected.
- **dashboard** (Next.js) — runs GraphQL Codegen against it to produce typed
  query hooks.

Keeping the schema in its own library means a schema change cascades to both
consumers through the Nx project graph, without either side depending on the
other.
