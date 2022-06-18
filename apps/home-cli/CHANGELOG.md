# Changelog

## 0.12.0

- Completed UI reflow, with added support for pinned items & metadata
- Routines activated via CLI should properly flag as such in the controller in the recent activations list

### 0.11.7

- Removing more builder workflows
- Added ability to provide a person id via configuration
  - This will provide item pins, instead of manipulating the configuration
- Added person menus
- Added activations for group / room / person states directly inside the main entry for the item

### 0.11.3

- Dropped builder workflows
  - Some other functionality got caught in the crossfile. Code exists but is too broken to leave in UI
- Tag represents a commit that it will build without errors

## < 0.5.x

Original buildout + proof of concept work.
Prior to `0.6.0`, `home-cli` was the only method of interacting with `home-controller` and configuring.
