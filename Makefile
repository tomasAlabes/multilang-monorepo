# Cross-language task runner for the native-tooling monorepo variant.
#
# Each language keeps its idiomatic tooling:
#   - TypeScript : pnpm + Turborepo  (task graph + caching for TS only)
#   - Go         : go.work
#   - Python     : uv workspace
#   - Protobuf   : buf
#
# Turborepo handles the affected-graph WITHIN TypeScript. It cannot see the
# proto -> models-ts edge (no JS dependency exists), so `codegen` is always
# run before builds, and CI's path filters (.github/filters.yaml) encode the
# cross-language dependency map by hand.

.PHONY: install codegen build test lint clean \
        build-ingest-service test-ingest-service \
        build-api-gateway test-api-gateway \
        build-anomaly-detector test-anomaly-detector \
        build-dashboard

install:
	pnpm install
	go work sync
	uv sync

codegen:
	buf generate

# --- aggregate build / test / lint ---
build: codegen
	pnpm exec turbo run build
	go build ./...
	uv build --all-packages

test:
	pnpm exec turbo run test
	go test ./...
	uv run pytest

lint:
	pnpm exec turbo run lint
	go vet ./...
	uv run ruff check .

# --- per-project targets, invoked by CI's affected jobs ---
build-ingest-service: codegen
	cd services/ingest-service && go build ./...
test-ingest-service:
	cd services/ingest-service && go test ./...

build-api-gateway: codegen
	cd services/api-gateway && go tool gqlgen generate && go build ./...
test-api-gateway:
	cd services/api-gateway && go test ./...

build-anomaly-detector: codegen
	uv build --package anomaly-detector
test-anomaly-detector:
	uv run pytest ml/anomaly-detector

build-dashboard: codegen
	pnpm exec turbo run build --filter=dashboard

clean:
	rm -rf dist .turbo node_modules apps/*/.next
