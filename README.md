# 🦕 [@steggy](https://github.com/ccontour/steggy) monorepo

## Applications

### [Home Controller](apps/home-controller) (backend) + [Home Configure](apps/home-configure) (frontend)

Standalone automation driver with integrations for Home Assistant, Node Red, and more.

![example](./apps/home-configure/docs/images/main.png)

### [Node Red Contrib](libs/node-red-contrib-steggy)

<!-- 🙊 shh, it's an app in disguise. 🙊 -->

Node Red integration for [Home Controller](apps/home-controller).

![example](./libs/node-red-contrib-steggy/docs/main.png)

### [Home CLI](apps/home-cli)

Standalone terminal app to issue commands against [Home Controller](apps/home-controller)

![example](./apps/home-cli/docs/images/example.png)

### [Config Builder](apps/config-builder)

A script to manage file based configurations for applications based off `@steggy/boilerplate`.

![example](./apps/config-builder/docs/example.png)

### [Log Formatter](apps/log-formatter)

Pipe JSON logs in via stdin, get pretty/readable logs out.
Fills same idea as [pino-pretty](https://www.npmjs.com/package/pino-pretty), but using the `SyncLogger` formatter from this repo.

### [Build Pipeline](apps/build-pipeline)

> (internal tool)

The code used to create and publish builds when code changes.
Not publicly published, but available as the `yarn pipeline` command.

![example](./apps/build-pipeline/docs/example.png)

### [Pico Relay](apps/pico-relay)

Microservice to watch a Lutron Hub for events coming from Pico remotes.
Events are relayed to Home Assistant as sensor updates.
Used together with logic inside [Home Controller](apps/home-controller) to drive logic

## Libraries

### [Boilerplate](libs/boilerplate)

NestJS application bootstrapping functions and general purpose tools.

### [Controller SDK](libs/controller-sdk)

Logical providers for use in [Home Controller](apps/home-controller)

### [Controller Shared](libs/controller-shared)

Shared type definitions for everything working together on [Home Controller](apps/home-controller)

### [Home Assistant](libs/home-assistant)

Home Assistant websocket and traffic management, http api wrapper, and general coordinator

### [Home Assistant Shared](libs/home-assistant-shared)

Shared type definitions related to the [Home Assistant](libs/home-assistant) library

### [Persistence](libs/persistence)

General purpose mongodb persistence tools.
Quickly form connections, and create complex queries

### [Server](libs/server)

Enables web server functionality for [@steggy/boilerplate](libs/boilerplate).
Performs generic middleware tools like `cors` and automatic request logging

### [TTY](libs/tty)

> friends with [chalk](https://www.npmjs.com/package/chalk) for formatting

Utilities for creating terminal applications.

- Menus
- Prompts
- Keyboard management
- Screen management
- Cursor management

### [Utilities](libs/utilities)

General purpose utilities and constants for `@steggy`

## Development goals by minor revision

> - `0.11.x` Configuration management & TTY overhaul
> - `0.10.x` Buildout of people, additional focus on UI completeness / consistency
> - `0.9.x` Focus on quality of life and platform stability updates
> - `0.8.x` Build out of metadata, which enales virtual states that can be set / watched
> - `0.7.x` Buildout of dynamic enabling of routines, which allows routines to decide if they should allow activation requests
> - `<=0.6.x`: Proof of concept + prepping repo to be open sourced

<!-- - [MQTT](libs/mqtt) -->
<!-- - [Rules Engine](libs/rules-engine) -->
