# infra — Terragrunt under Nx

A sample Terragrunt module wired into the Nx workspace, to show how
infrastructure-as-code fits the same project model as the Go/Python/TS
projects: a `project.json` exposing `nx:run-commands` targets.

It is **credential-free** on purpose — a local backend plus the `null` and
`local` providers, so `nx run infra:plan` works with no cloud account and the
sample stays verifiable like the rest of `main`. The real Source.ag infra repo
(`source-infra`) uses the same `root.hcl` + `modules/` + `live/` layout with an
S3 backend and AWS providers; this mirrors the shape, not the cloud.

## Layout

```
infra/
  root.hcl                              shared Terragrunt config (local backend)
  modules/deployment-manifest/          reusable Terraform module
  live/dev/
    env.hcl                             environment-scoped vars (read by root.hcl)
    deployment-manifest/terragrunt.hcl  the unit: includes root, points at module
  project.json                          Nx project "infra"
```

The module renders a deployment manifest for the monorepo's deployable services
(`ingest-service`, `api-gateway`, `anomaly-detector`) to a local JSON file —
enough to exercise the full init/plan/apply lifecycle without real resources.

## Commands

```bash
mise exec -- pnpm exec nx run infra:fmt        # terragrunt hcl format
mise exec -- pnpm exec nx run infra:validate   # terragrunt run validate
mise exec -- pnpm exec nx run infra:plan       # terragrunt run plan
mise exec -- pnpm exec nx run infra:apply      # terragrunt run apply -auto-approve
mise exec -- pnpm exec nx run infra:destroy    # terragrunt run destroy -auto-approve
```

Terraform (1.14.7) and Terragrunt (0.99.4) are pinned in the repo's `mise.toml`,
matching `source-infra`. The targets use the new Terragrunt CLI's explicit
`terragrunt run <cmd>` form.

## Nx integration

`infra` is a first-class Nx project: it appears in `nx show projects`, and a
change under `infra/` shows up in `nx affected` (e.g.
`nx show projects --affected --files=infra/modules/deployment-manifest/main.tf`).

It is intentionally **standalone** — no `implicitDependencies`. To make an infra
change cascade from a service (so `nx affected` rebuilds infra when, say,
`ingest-service` changes), add the service names to `implicitDependencies` in
`project.json`, the same way the Go services depend on `models-go`/`common-go`.
