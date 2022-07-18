# Config Builder

Config builder is a companion script for other applications inside this repository.
It can take metadata output by an application, present a series of prompts to allow a user to configure the app,
then write it in a location / format that the app can read from.

## Install

```bash
# install
yarn global install @steggy/config-builder
# upgrade
yarn global upgrade @steggy/config-builder
```

## General Theory

Through the `@InjectConfig` injection mechanism provided by `@steggy/boilerplate`, a list of possible configuration options can be assembled.
Libraries and applications declare all possible configurations for their local project at the module level, along with types/descriptions/etc.
Once the application is bootstrapped, a module scanner searches through the application, looking for consumed configs (filter out declared, but unused configuration options).
All of this metadata is combined, along with the application provided default values, then written as json to a file.

The config builder script can then read that captured application metadata, and present it to the user as a series of prompts.
Once the configuration is assembled, the script can either:

1) Present the values as key/value pairs
   - These values can be used in docker-compose.yaml environment variables
2) Write the configuration to a local file
   - defaults to: file data was loaded from > default / favorite location
   - can select from any file the app knows to look for

## Usage

Inside of this repository, all configurable apps have pre-assembled yarn commands which perform a scan + loads builder from that.

- `yarn configure:{app-name}`

### With `@QuickScript`

For applications build off the `@QuickScript` annotation, there is a built-in scanner accessible with the `--scan-config` flag.
Inside this repo, example apps:

- `build-pipeline`
- `config-builder`
- `pico-relay`

Example manual scan + configuration of the build pipeline script

```bash
build-pipeline --scan-config > ./config.json
config-builder --definition-file ./config.json
```

### Read / Write to custom file

Default operation has the config builder only attempting to load configuration information from a pre-built internal list.
This is great for something like `home-cli`, which is intended to run locally.
For situations where you want to use any random file as the config source, use the `CONFIG_FILE` option.
This will cause the script to only load data from that file, and a new option to write back to that file will be presented.

```bash
config-builder --definition-file ./config.json --config-file ./special-config.ini
```
