# Changelog

## 22.29.1

- Added custom methods to compress and serialize / unserialize objects
  - Utilizes gzip to achieve far smaller strings than normal JSON
- Added new lifecycle event: `rewire`
  - Called prior to pre-init, is intended for overriding the entire application flow for some purpose

## 0.12.0

- Pretty logger: added new lightlight symbol `>`
  - Intended for use with messages like **Item 1 > Item 2 > Item 3**
  - Seperator Will be highlighted blue
- `@QuickScript`: Added the ability to set up the annotated class as a controller
  - Still requires that `ServerModule` get involved, and appropriate boot options set
- Added support for `string[]` config types
  - Handles `--property` switch being passed via command line multiple times

## 0.11.13

- `@QuickScript` application symbol is now optional
- Added `reflect-metadata` as a dependency
  - It existed before, but wasn't declared anywhere
- Updated `@InjectConfig` to be able to take in metadata inline
- Added internal flag to disable loading user configs

## 0.11.6

- Config metadata can now be provided inline with the @InjectConfig for applications now
  - `@InjectConfig('PROPERTY', { description: 'lorem ipsum' }) ...`
- Config sanity check is performed at boot now
  - Warnings are emitted for `warnDefault`
  - Application will emit fatal log message + exit on `required` properties not being provided

## 0.11.5

- In case of multiple similar environment variables being passed (`BASE_URL` vs `base_url`), an exact match to the expected case will be prioritized

## 0.11.4

- Config scanning functionality resurrected
  - Calling `ScanConfig` with a reference to the `INestApplication` will return an object that represents a deduplicated list of all injected configuration definition.
  - `@QuickScript` now looks for `--scan-config` command line switch. If passed, a config scan will be performed with the results being output to the console instead of running the script.
- `WorkspaceService` now provides the functionality of loading configs from files
- Command line switches now properly take priority over environment variables
- Command line switches and environment variables are now case insensitive (dashes and underscores are interchangable also)

## 0.10.28

- Boilerplate: `@QuickScript` can now take in bootstrap options to pass through.
  - Enables `NestJS` & `@steggy/server` modules for microservice creation
