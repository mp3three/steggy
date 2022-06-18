# Changelog

## 0.12.0

- Added support for `string[]` config types

## 0.11.13

- Providing a `CONFIG_FILE` will make the script ignore any other configuration files that are on the system when loading data
- Added extra cosmetic detail to the "write to cofig file" option

## 0.11.9

- Added marker to indicate which project is the application (vs all the supporting libraries)

### 0.11.3

- Revived project
- Config builder now works off a prebuilt json definition, instead of attempting to perform a scan directly itself
  - Pre-computed configs can be shipped with docker containers now, and easily copied / used
- Added the ability to output to a specified target file
- Added the ability to output as key/value pairs appropriate for environment variables
