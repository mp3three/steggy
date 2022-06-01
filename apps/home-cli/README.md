# Home CLI

## Description

Home CLI is a command / control tool for the Home Controller, with interactions provided by the TTY library.
It is not intended for configuration, but as a tool for consuming the existing configuration via the terminal.
It can activate save states, work with pinned items, trigger routines, and more.

## Install

The `home-cli` bash command can be installed through NPM, or by building the command from the repository source.
Yarn is the recommended install method if available.

### Yarn

```bash
# install
yarn global add @steggy/home-cli
# update
yarn global upgrade @steggy/home-cli
```

### NPM

```bash
npm install -g @steggy/home-cli
```

### From source

```bash
npx nx local-install home-cli
```

## Configuration

The most straightforward way of configuring `home-cli` is to use the provided `config-builder` app. This is usable by running this command from the repository root:

```bash
yarn configure:home-cli
```

This command will present all available configuration options, and is capable of writing a correctly formatted config file in a location the cli can find it.

### Quick setup

Home CLI will respect environment variables and command line switches, but ini file based configuration is the recommended way.
This represents the minimum configuration, which can be placed at `~/.config/home-cli`

```ini
[application]
  CONTROLLER_API=http://localhost:7000

  ADMIN_KEY=super secret password

  ; To load items pinned on the home-controller frontend:
  ; Uncomment, and add the identifier of a person
  ; USER_ID=
```

Home CLI can be enhanced redis cache if one is available.
Redis allows the app to keep track of last selected menu entries between loads

## Run in development mode

> All commands run from the repository root

**Note:** development server DOES NOT respond exactly the same way as production builds.
This is partly a result of the webpack dev server getting involved.
The app may not quit / cleanup the console as effectively as the production build does as a reuslt.

```bash
# Install all dependencies
yarn install
# Update the configuration for the app
yarn configure:home-cli
# Start the home-cli development server
npx nx serve home-cli
```
