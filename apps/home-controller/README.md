The Home Controller is a NodeJS service that connects to an existing Home Assistant (HA) install through a combination of the websocket and http APIs.
It listens to state changes coming from entities, and is capable of triggering routines in response.
The controller (currently) specializes in lighting and scene control, with some general support for most HA entity domains.

## Docker Install

> See [wiki](https://github.com/ccontour/text-based/wiki) for development / bare metal install information

**Example configuration file** *(good presets for docker install)*

```ini
[libs.controller-logic]
  ; MongoDB or compatible URI. No support for sql databases
  MONGO_URI=mongodb://mongo:27017/text-based

[libs.home-assistant]
  ; Base url to your Home Assistant install
  BASE_URL=https://homeassistant.your.domain
  ; Home Assistant Long lived access token
  TOKEN=<HOME ASSISTANT ACCESS TOKEN>

[libs.utilities]
  ; Redis is preferred if available.
  ; Defaults to in-memory caching, which can lose state on reboot
  CACHE_PROVIDER=redis
  REDIS_HOST=redis
  ; debug | info | warn | error | silent
  LOG_LEVEL=debug

[libs.server]
  ; Authentication required by default. Provide a password to protect your stuff
  ADMIN_KEY=super secret password
```

**Example `docker-compose.yaml`** *(recommended basic setup)*

```yaml
---
version: '2'

volumes:
  mongo:

services:
  redis:
    image: redis:latest
    restart: unless-stopped

  mongo:
    image: mongo:latest
    restart: unless-stopped
    volumes:
      - mongo:/data/db

  home-controller:
    image: ghcr.io/ccontour/home-controller:latest
    container_name: home-controller
    volumes:
      # Mount configuration as a file named `config`
      - /path/to/config/file:/home/node/.config/home-controller/config
    restart: unless-stopped
    depends_on:
      - redis
      - mongo
    ports:
      # external_port:internal_port
      - "7000:7000"
```
