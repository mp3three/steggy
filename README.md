See the wiki for project notes / documentation!

## Development

- VSCode + extensions
  - ESLint
  - Prettier
  - Nx Console
  - (optional): Material Icon Theme

The included vscode workspace file (`automagical.code-workspace`) provides editor bindings for configuration files, and json schema definitions.
Code is formatted using a combination of heavy handed linting rules, and prettier.
Nx provides coordination, with all `serve` / `build` / `lint` commands being available through the console.

Current settings for the Material Icons theme extension is stored in `/material-icons.json`

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
