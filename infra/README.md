# infra — Terragrunt under Pants

A sample Terragrunt module wired into the Pants workspace, to show how
infrastructure-as-code fits Pants' build-graph model alongside the
Go/Python/TS projects.

It is **credential-free** on purpose — a local backend plus the `null` and
`local` providers, so the lifecycle runs with no cloud account. The real
Source.ag infra repo (`source-infra`) uses the same `root.hcl` + `modules/` +
`live/` layout with an S3 backend and AWS providers; this mirrors the shape,
not the cloud. The Terragrunt/Terraform source here is identical to the other
branches — only the orchestration (BUILD files vs. Nx `project.json`) differs.

## Layout

```
infra/
  BUILD                                 files(:sources) + fmt run target
  root.hcl                              shared Terragrunt config (local backend)
  modules/deployment-manifest/          reusable Terraform module
  live/dev/
    env.hcl                             environment-scoped vars (read by root.hcl)
    deployment-manifest/
      terragrunt.hcl                    the unit — includes root, points at module
      BUILD                             validate/plan/apply/destroy run targets
```

The module renders a deployment manifest for the monorepo's deployable services
(`ingest-service`, `api-gateway`, `anomaly-detector`) to a local JSON file —
enough to exercise the full init/plan/apply lifecycle without real resources.

## Commands

```bash
pants run infra:fmt                                    # terragrunt hcl format
pants run infra/live/dev/deployment-manifest:validate  # terragrunt run validate
pants run infra/live/dev/deployment-manifest:plan      # terragrunt run plan
pants run infra/live/dev/deployment-manifest:apply     # terragrunt run apply -auto-approve
pants run infra/live/dev/deployment-manifest:destroy   # terragrunt run destroy -auto-approve
```

Terraform (1.14.7) and Terragrunt (0.99.4) are pinned in the repo's `mise.toml`,
matching `source-infra`. The targets use the new Terragrunt CLI's explicit
`terragrunt run <cmd>` form.

## Pants integration

Terragrunt has no native Pants backend, so — like `gqlgen` and `buf` elsewhere
in this repo — it is wrapped as a shell target. The codegen steps use the
sandboxed, cacheable `shell_command`; infra commands are side-effecting (they
touch state and a real setup would hit a cloud backend), so they use
`run_shell_command`, which executes directly in the workspace and is invoked
with `pants run`.

Each run target declares `//infra:sources` as an `execution_dependency`, so a
change to the module or `root.hcl` is tracked against the targets — the Pants
equivalent of putting `infra` on the affected graph. `run_shell_command`
targets are graph roots (they can't be consumed by other targets), which suits
terminal infra operations.
