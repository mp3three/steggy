# Home Controller

## Description

The Home Controller is the backend logic provider for the project. It connects to Home Assistant via a combination of the websocket api, and rest calls.
The Home Configure project acts as the primary user interface, and is delivered as part of the same docker container

## Server Configuration

### Recommended basic setup

```ini
[libs.boilerplate]
  CACHE_PROVIDER=redis

  REDIS_HOST=redis

  LOG_LEVEL=debug

[libs.controller-logic]
  MONGO_URI=mongodb://mongo:27017/home-controller

[libs.home-assistant]
  BASE_URL=https://homeassistant.your.domain

  TOKEN=

[libs.server]
  ADMIN_KEY=super secret password
```

### All Options

```ini
[libs.boilerplate]
  ; default = info
  LOG_LEVEL=info | warn | debug

  ; default = memory
  CACHE_PROVIDER=redis | memory

  ; only used with redis cache provider
  REDIS_HOST=localhost

  REDIS_PORT=6379

  REDIS_DEFAULT_TTL=86400

[libs.controller-logic]
  ; modify the internal timing of the sequence activation event
  SEQUENCE_TIMEOUT=1500

  ; light temperature (kelvin) at solar noon
  CIRCADIAN_MAX_TEMP=5500

  ; light temperature (kelvin) at night
  CIRCADIAN_MIN_TEMP=2000

  ; minimum brightness amount for dimmer operations
  MIN_BRIGHTNESS=5

  ; data storage location
  MONGO_URI=mongodb://localhost:27017/automagical

  ; file path; optional / used with ssl connections to mongo
  MONGO_CERT=

  ; file path; optional / used with ssl connections to mongo
  MONGO_KEY=

  ; file path; optional / used with ssl connections to mongo
  MONGO_CA=

  ; file path; optional / used with ssl connections to mongo
  MONGO_CRL=

[libs.home-assistant]
  ; long lived access token
  TOKEN=

  BASE_URL=http://localhost:8123

  ; optional override, manually specify ws[s]:// target to connect to
  WEBSOCKET_URL=

  ; emit warnings if controller attempts to send more than this many commands
  ; via websocket in under a second
  WARN_REQUESTS_PER_SEC=300

  ; self terminate if controller attempts to send more than this many commands
  ; via websocket in under a second.
  ;
  ; likely to have some sort of infinite loop situation that (if left unattended)
  ; might also take down home assistant
  CRASH_REQUESTS_PER_SEC=500

  ; maximum time to wait for template rendering requests
  RENDER_TIMEOUT=3

  ; retry interval for dropped home assistant socket connections
  RETRY_INTERVAL=5000

[libs.server]
  ; Prefix routes with value
  ; ex: http://localhost:7000/normal/route/path => http://localhost:7000/api/normal/route/path
  ;
  ; Note: this only affects the server side, and may cause issues for some ui layer code
  GLOBAL_PREFIX=/api

  ; cors origin
  CORS=*

  ; enable csrf middleware
  ; https://github.com/pillarjs/understanding-csrf
  CSURF=true

  ; rollover point for http request id tracking
  MAX_REQUEST_ID=1000000000

  ; max http body size
  BODY_SIZE=100kb

  ; gzip responses before sending
  COMPRESSION=true

  ; not recommended to change for dockerized deployments
  PORT=7000

  ; endpoint to access swagger documentation at
  ; does not need to be same as GLOBAL_PREFIX
  SWAGGER_PATH=/api

  ; blank to disable, value is compared against `x-admin-key` header to authenticate
  ADMIN_KEY=

  ; http requests authenticate by default
  AUTH_BYPASS=false

  ; /version endpoint will return 404
  HIDE_VERSION=false

  ; enable direct https connections to server
  SSL_PORT=

  ; file path; required if SSL_PORT is set
  SSL_KEY=

  ; file path; required if SSL_PORT is set
  SSL_CERT=

```

## Deployments

### Docker Compose

A MongoDB compatible database is required. Redis is recommended, but optional

```yaml
---
version: "2.1"

volumes:
  mongo:

services:
  home-controller:
    image: containers.programmable.work/home-controller:latest
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

While in develoment environments, the server will attempt to proxy UI requests to port `4200`, where the home-configure server is expected to attach.
This allows the controller to act as the primary server like what happens in dockerized deployments.

### Bare Metal

Bare metal installs are not an officially supported use case. A non-dockerized production optimized build can be launched through the following commands run from the repository root

```bash
# Build backend code
npx nx build home-controller --configuration=production
# Build ui
npx nx build home-configure --configuration=production
# Make ui assets available for backend to serve
mv dist/apps/home-configure dist/apps/home-controller/ui
# Launch server
node dist/apps/home-controller/main.js
```

Note: production builds output json logs
