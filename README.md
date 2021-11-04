# @automagical

## Initial Install

### Minimum Dependencies

> Things required for basic operation of this repo

- node.js: This repository is developed against node 16.
- yarn

### Home Controller Dependencies

- mongodb (or compatible)
- (recommended): redis
- Completed Home Assistant install, with integrations already set up
  - Access token

> mongodb + redis can be quickly installed via docker using `tools/selfhosted/databases.docker-compose.yaml` for a minimal setup

### Development

- VSCode + extensions
  - ESLint
  - Prettier
  - Nx Console
  - (optional): Material Icon Theme

The included vscode workspace file (`automagical.code-workspace`) provides editor bindings for configuration files, and json schema definitions.
Code is formatted using a combination of heavy handed linting rules, and prettier.
Nx provides coordination, with all `serve` / `build` / `lint` commands being available through the console.

Current settings for the Material Icons theme extension is stored in `/material-icons.json`

## Configuration

### NodeJS Projects

> - Devtools
> - Home Controller
> - Home CLI

NodeJS based projects can be configured using devtools, or a `yarn` command from the base of the repo.
This will run a script to guide you through configuring the application, and saving the config file to your system.

- `yarn configure:home-controller`
- `yarn configure:home-cli`
- `yarn configure:devtools`

## Extra Notes

### Port Reservations

> Ports used by this repo, and what for

| Port | Item |
| --- | --- |
| 33334 | NodeJS Debugger: Home Controller |
| 33335 | NodeJS Debugger: Dashboard |
| 33336 | NodeJS Debugger: Devtools |
| 33337 | NodeJS Debugger: Home CLI |
| 7000 | Home Controller (default http port) |
