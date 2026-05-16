# Nx primer

A focused tour of the Nx concepts that matter in this repo. Nx is the
**orchestrator** on the `main` branch — it doesn't compile TypeScript, run Go,
or invoke `buf` itself. It coordinates *when* and *in what order* those tools
run, and caches their results.

If you remember nothing else: Nx is a task runner over a project graph, with
a content-addressed cache and an "affected" filter on top.

---

## 1. Projects

A **project** is any directory with a `project.json` (or, for TS, a
`package.json` Nx infers). Each project has:

- a **name** (`"name": "proto"`)
- **tags** — free-form labels (`scope:contracts`, `lang:proto`)
- **targets** — named actions you can run against it (`build`, `lint`,
  `codegen`, …)

Example: `libs/proto/project.json` exposes `lint`, `format`, `breaking`,
`codegen`. None of these are TypeScript builds — Nx happily wraps any shell
command via the `nx:run-commands` executor.

List every project Nx sees:

```bash
nx show projects
```

## 2. Targets and executors

A target is `{ executor, options, inputs, outputs, dependsOn, cache }`.

- **`executor`** — the thing that runs. `nx:run-commands` (shell out),
  `@nx/next:build`, `@nx/js:tsc`, etc.
- **`dependsOn: ["^build"]`** — "first build every project I depend on."
  The `^` means "dependencies of," not "this project." This is how a
  `proto` codegen change forces `models-go` → `ingest-service` to rebuild.
- **`inputs` / `outputs`** — what files feed the task and what files it
  produces. The cache key is hashed over inputs; outputs are restored on a
  cache hit.
- **`cache: true`** — opt this target into the cache.

Target defaults live in `nx.json` under `targetDefaults`, so you don't
repeat `dependsOn: ["^build"]` in every project.

## 3. The project graph

Nx builds a DAG of project → project edges from two sources:

1. **TypeScript imports** — inferred automatically. If
   `apps/dashboard` imports `@greenhouse/models-ts`, the edge appears.
2. **`implicitDependencies`** — declared in `project.json` for everything
   Nx can't parse: Go modules, Python packages, generated-code producers.

In this repo `libs/models-go` declares `implicitDependencies: ["proto"]`
because Nx has no idea `proto/codegen` produces `.go` files inside it.

Visualise it:

```bash
nx graph                      # opens an interactive graph in the browser
nx graph --file=graph.json    # dump to JSON
```

**Gotcha:** if you wire a new cross-language dependency and forget the
implicit edge, `nx affected` will quietly miss it and CI will be green on a
broken state. Always check `nx graph` after such changes.

## 4. Caching

Nx hashes `(inputs, executor, options, env)` and stores task outputs +
stdout/stderr keyed by that hash. Re-run the same task with no changes and
Nx replays the cached output instead of executing.

What goes into the hash is controlled by **named inputs** in `nx.json`:

```json
"namedInputs": {
  "default": ["{projectRoot}/**/*", "sharedGlobals"],
  "production": ["default", "!{projectRoot}/**/*.spec.ts", …],
  "sharedGlobals": ["{workspaceRoot}/tsconfig.base.json",
                    "{workspaceRoot}/go.work",
                    "{workspaceRoot}/buf.yaml",
                    "{workspaceRoot}/buf.gen.yaml"]
}
```

Two patterns worth understanding:

- **`production` vs `default`** — `build` consumes `production` (excludes
  tests) while `test` consumes `default`. Editing a test file invalidates
  the test cache but not the build cache.
- **`sharedGlobals`** — anything in here invalidates every task. Changing
  `buf.yaml` should bust every codegen cache, so it's listed here.

The cache lives under `.nx/cache`. Wipe it with `nx reset` if something
seems stuck.

## 5. `nx affected`

The killer feature of a monorepo orchestrator: only run tasks for projects
touched by the current diff.

```bash
nx affected -t build               # build only affected projects
nx affected -t lint test build     # multiple targets
nx show projects --affected --files=libs/proto/greenhouse/v1/sensor.proto
```

Mechanics:

1. Nx compares `HEAD` against a base SHA (`defaultBase: "origin/main"` in
   `nx.json`).
2. It maps changed files → projects that own them.
3. It walks the project graph downstream, collecting every dependent.
4. It runs the requested targets on that set.

In CI (`.github/workflows/ci.yml`) the base SHA comes from
`nrwl/nx-set-shas`, which figures out the right merge-base for push vs PR
events. Without it `affected` defaults to "everything," which silently
defeats the point.

## 6. `run-many` vs `affected` vs single project

```bash
nx build dashboard            # one project, one target
nx run-many -t build          # every project that has a build target
nx affected -t build          # only the affected subset
```

Local development: usually `nx build <project>` or `nx affected -t build`.
CI: `nx affected -t lint test build`. Releases / first clones:
`nx run-many -t build`.

## 7. Running non-Nx tools through Nx

Wrapping a foreign tool gets you caching and affected-awareness for free.
The proto codegen target is a good example — `buf generate` is a plain CLI,
but expressed as an Nx target:

```json
"codegen": {
  "executor": "nx:run-commands",
  "outputs": [
    "{workspaceRoot}/libs/models-go/gen",
    "{workspaceRoot}/libs/models-ts/src/gen",
    "{workspaceRoot}/libs/models-py/src/greenhouse"
  ],
  "options": { "command": "buf generate", "cwd": "{workspaceRoot}" }
}
```

Now `nx codegen proto` is cacheable (same `.proto` files ⇒ same generated
output, restored from cache), and any downstream target with
`dependsOn: ["^codegen"]` will trigger it automatically.

## 8. Tags and constraints

Tags (`scope:contracts`, `lang:go`, …) are documentation by default but can
be enforced via the `@nx/enforce-module-boundaries` ESLint rule — e.g.
"nothing tagged `scope:frontend` may import a `scope:service`." Not wired
up here yet, but worth knowing the lever exists.

## 9. Day-to-day cheat sheet

```bash
# What does Nx think exists?
nx show projects
nx graph

# Build / test
nx build dashboard
nx run-many -t build
nx affected -t lint test build

# What would be affected by an in-progress change?
nx show projects --affected
nx show projects --affected --files=libs/proto/**/*.proto

# Forget everything
nx reset
```

## 10. Where Nx stops

Nx does **not**:

- install dependencies — pnpm / uv / `go mod` still own that
- know about Go workspace `replace` directives — `go.work` does
- regenerate code on its own — `buf` does, Nx just schedules the call
- understand Python or Go import graphs — hence `implicitDependencies`

Think of Nx as a thin coordination layer: a graph, a task runner, and a
cache. Everything language-specific is still done by the native tool.

## Further reading

- `nx.json` — target defaults, named inputs, base branch
- Each `project.json` — that project's targets and implicit deps
- `https://nx.dev/concepts` — official conceptual docs
