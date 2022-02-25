# Automation Controller

## Docker Compose

```yaml
---
version: "2.1"

volumes:
  mongo:

services:
  home-controller:
    image: ghcr.io/ccontour/home-controller:latest
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
      - 7000:7000

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

## Example Config

```ini
[libs.boilerplate]
  CACHE_PROVIDER=redis
  REDIS_HOST=redis
  LOG_LEVEL=debug

[libs.controller-logic]
  MONGO_URI=mongodb://mongo:27017/home-controller

[libs.home-assistant]
  BASE_URL=https://homeassistant.domain.example
  ; Long-Lived Access Token
  TOKEN=

[libs.server]
  ADMIN_KEY=super secret password
```
