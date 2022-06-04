# Log Formatter

Translate json logs to pretty logs by passing them through stdin

## Example usage

```bash
docker logs -f home-controller | log-formatter
```

![before](./docs/from.png)
![after](./docs/to.png)
