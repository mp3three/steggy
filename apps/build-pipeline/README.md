# Build Pipeline

This code manages the build and publish workflow for this repository.
The app itself isn't published anywhere, but cached locally in `tools/scripts`.

## Workflow

The build pipeline will scan through all apps first, looking for apps that were
affected by changes that have not been pushed to `origin/master` yet.

Any apps that are affected (and have a publish target for nx) will be presented as options to
version bump + republish.

If any libraries are affected, then a confirmation prompt to bump libraries will be shown.
If accepted, the root repository version will be bumped, and that version is transferred to all libraries.
All libraries will then be published using the updated + synchronized version (regardless if there is actually a change).

After all libraries are published, then the selected applications will receive version bumps, and also get published.

## Config options

```bash
yarn configure:build-pipeline
```

- `NON_INTERACTIVE` Rebuild all libraries (if they were affected at all), and all affected apps. Do not prompt for user input
- `BUMP_ONLY` Just bump the `package.json` version. Do not build / publish
- `RUN_AFTER` Path to a bash script to run after pipeline finishes. Intended to kick off local deployment workflows
