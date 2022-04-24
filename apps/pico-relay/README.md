# Lutron Relay

Example Config

```ini
[application]
  LUTRON_HOST=10.0.0.27
  HOMEASSISTANT_URL=http://homeassistant.some-domain
  HOMEASSISTANT_TOKEN=<LONG LIVED ACCESS TOKEN>

[application.PICO_MAPPINGS]
; {sensor id} = {entity_id to use in home assistant}
  13=sensor.test_remote_1

; Uncomment to show all events in debug logs
; Can be used to retrieve id for something by referencing debug logs and pushing buttons on the device
; [libs.boilerplate]
;   LOG_LEVEL=debug
```

## Deploy

### Docker

docker-compose.yaml

```yaml
---
version: "2.1"

services:
  pico-relay:
    image: mp3three/pico-relay:latest
    container_name: pico-relay
    volumes:
      - /path/to/config_file:/.pico-relayrc
    restart: unless-stopped
```

### Finding Sensor IDs

Example debug log line:

> {"action":"~DEVICE","button":"4","direction":"4","id":"13"}

The ID property ("13" in this example) is the value that can be used in the PICO_MAPPINGS config.
