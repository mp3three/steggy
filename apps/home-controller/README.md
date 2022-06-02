# Home Controller

## Description

The Home Controller is the backend logic provider for the project. It connects to Home Assistant via a combination of the websocket api, and rest calls.
The Home Configure project acts as the primary user interface, and is delivered as part of the same docker container

## Server Configuration

### Recommended basic manual setup

```ini
[application]
; Want to use the node red integration?

  ; NODE_RED_URL=http://node-red.localhost

[libs.boilerplate]
; Redis is preferred, but optional
  ; REDIS_HOST=localhost
  ; CACHE_PROVIDER=redis

; Additional logs available if desired
  ; LOG_LEVEL=debug

[libs.home-assistant]
  TOKEN=<long lived access token>
  BASE_URL=http://your.homeassistant.server

[libs.persistence]
  MONGO_URI=mongodb://localhost:27017/steggy


[libs.server]
  ADMIN_KEY=super secret password
```

### Development Configuration

If running the development server, the canned configuration script will place files in the correct location.

```bash
yarn configure:home-controller
```

### Config builder + docker containers

If you have `config-builder` installed locally, you can use a pre-computed scan that ships with the docker image.

```bash

```

## Deployments

### Docker Compose

```yaml
---
version: "2.1"

volumes:
  mongo:

services:
  home-controller:
    image: mp3three/home-controller:latest
    container_name: home-controller
    volumes:
      - /path/to/config_file:/.home-controllerrc
    restart: unless-stopped
    depends_on:
      - redis
      - mongo
    links:
      - redis
      - mongo
    ports:
      - "7000:7000"

  redis:
    container_name: home-controller_redis
    image: redis
    restart: unless-stopped

  mongo:
    container_name: home-controller_mongo
    image: mongo
    restart: unless-stopped
    volumes:
      - mongo:/data/db

```

### Development

> Note: ALL development features are enabled while in development mode
>
> UI is loaded with react development tools + hot module reload enabled.
>
> Server will also watch local files for changes + automatic restart
>
> Server enables pretty logger for better human readability

Recommended location for configuration file is `~/.config/home-controller`. Format of file is described above

To start the development server:

- `npx nx serve home-controller`

To enable the ui:

- `npx nx serve home-configure`
