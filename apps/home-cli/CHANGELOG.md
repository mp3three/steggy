# Changelog

## 0.11.x

> Shifting the vision away from a configuration tool to a more minimal command issuing type of role.
>
> All "building" prompts are being removed, tools to manage existing data (delete stuff, change names, etc) is being kept.
> The general rule of thumb being: anything `home-configure` ALWAYS nests in drawers will not be be a cli feature
>
> - save state editing
> - editing of routine command / activations
> - /

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
