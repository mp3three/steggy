# Changelog

## 0.11.4

- Config scanning functionality resurrected
  - Calling `ScanConfig` with a reference to the `INestApplication` will return an object that represents a deduplicated list of all injected configuration definition.
  - `@QuickScript` now looks for `--config-scanner` command line switch. If passed, a config scan will be performed with the results being output to the console instead of running the script.
- `WorkspaceService` now provides the functionality of loading configs from files
- Command line switches now properly take priority over environment variables
- Command line switches and environment variables are now case insensitive (dashes and underscores are interchangable also)

## 0.10.28

- Boilerplate: `@QuickScript` can now take in bootstrap options to pass through.
  - Enables `NestJS` & `@steggy/server` modules for microservice creation