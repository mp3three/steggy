# Changelog

## 0.11.x

### 0.11.3

- Revived project
- Config builder now works off a prebuilt json definition, instead of attempting to perform a scan directly itself
  - Pre-computed configs can be shipped with docker containers now, and easily copied / used
- Added the ability to output to a specified target file
- Added the ability to output as key/value pairs appropriate for environment variables
