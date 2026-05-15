# ui (`@greenhouse/ui`)

Shared React component library. Currently exposes `SensorCard`. Consumed by
the `dashboard` app. Depends on `@greenhouse/common`; Nx infers both edges
(`common-ts` → `ui` → `dashboard`) from the import graph.
