# Changelog

## [0.1.0] — 2026-04-03

### Initial release

#### Generator

The core of this project is a fully automated code generation pipeline that keeps the library in sync with the upstream SPDX license registry.

- **Data sync** — fetches the canonical SPDX license list from `spdx/license-list-data` on GitHub and writes it to `meta/current-licenses.json`; exits early when the upstream data is unchanged (SHA-256 comparison)
- **Change detection** — tracks every license individually in `meta/generated-cache.json` using per-ID SHA-256 hashes; classifies each sync as *added*, *removed*, or *modified* and records which fields changed
- **TypeScript code generation** — emits one module per license under `src/generated/licenses/`, a bulk-export index, and a sorted `licenseIds` array; all output is formatted by Prettier before the build
- **ID encoding** — converts arbitrary SPDX identifiers (e.g. `Apache-2.0`, `0BSD`, `GPL-2.0-or-later`) to valid TypeScript constant names and safe filenames using a deterministic encoding scheme
- **Semver automation** — reads the configured bump strategy (`major` / `minor` / `patch`) from the environment and updates `package.json` accordingly
- **Changelog generation** — produces a structured markdown entry (Added / Changed / Removed sections) and a compact git commit message summarising the release
- **GitHub Actions integration** — writes `has_changes`, `new_version`, and `change_message` to `$GITHUB_OUTPUT` so downstream workflow steps can branch on whether a release is needed
- **Cooldown & bypass flags** — a configurable cooldown (default 24 h) prevents redundant runs; `BYPASS_COOLDOWN`, `BYPASS_CACHING`, and `BYPASS_FETCH` environment flags allow controlled overrides for CI and local development
- **Purge script** — `generator/purge-generated.ts` wipes `src/generated/` and resets the generated cache, enabling clean full-regenerations via `npm run regenerate`
- **Scheduled CI workflow** (`sync.yml`) — runs the generator automatically on Mondays and Thursdays at 06:00 UTC; commits changed sources, creates a version tag, and pushes — triggering the publish workflow when changes are detected
- **Publish workflow** (`publish.yml`) — publishes to npm on any `v*.*.*` tag push
