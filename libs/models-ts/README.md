# models-ts (`@greenhouse/models`)

TypeScript domain types generated from `libs/proto` via protobuf-es.

- **Source:** none of this is hand-written. `buf generate` produces `src/gen`.
- **Consumed by:** `dashboard`, `ui`, `common-ts`.
- **Graph edge:** `implicitDependencies: ["proto"]` — a proto change marks
  this library affected, which cascades to every TS consumer.

## Why the generated code is committed

`src/gen` is committed (not `.gitignore`d) so a fresh `pnpm install` builds
without a codegen step, IDEs resolve types immediately, and PR diffs show
exactly how a contract change ripples out. The `codegen-verify` workflow
re-runs `buf generate` and fails if the committed output is stale.
