# Build Pipeline

## 22.29.1

- Moved to date based versioning
  - All package.json files share the same version when published

## 0.12.0

- Added support for logs containing color codes
- Added ability to manually define base / head commits for `affected()`
- Added `RUN_ALL`
- Added `RUN_PROJECT` to manually define a project to build

## 0.11.15

- Added `NON_INTERACTIVE` & `BUMP_ONLY` configs
- Added `RUN_AFTER`
  - Runs a script after the pipeline completes

## 0.11.4

- Moved to separate app
- Can bump libraries

## 0.9.4

Initial add script.

- Version bumping for affected apps
- Build and publish apps
