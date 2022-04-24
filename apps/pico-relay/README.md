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

; Uncomment to show full event stream in logs
; Can be used to retrieve id by referencing debug logs
; [libs.boilerplate]
;   LOG_LEVEL=debug
```
