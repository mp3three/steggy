# Configuration

> NestJS configuration

This library is responsible for governing the configuration definitions, and setting up the config at boot time for the script/service to take advantage of.
Not all variables will make sense in all applications, each docker image should provide a config file with the minimum to make it work.

Primary config building work is done by [rc](https://www.npmjs.com/package/rc). Examples provided with this repo will be in INI format, but all configuration variables can also be provided as environment variables.

## Config organization

The [root level config](/classes/AutomagicalConfig.html) provides common basic options for configuring servers.

## Translating ini configs to environment variables

In this example, a config will be translated from ini to environment variables for the submission server.

### (Example) INI Config

> Uses out of date variables, for demonstration purposes only

```ini
MONGO=mongodb://mongo:27018/db_name

[libs.authentication]
  ; Input this value when connecting as an on-premise environment
  REMOTE_SECRET=changeme
[libs.license]
  ; Provide me
  LICENSE_KEY=
[libs.formiosdk]
  ; Base url of your portal
  PORTAL_BASE_URL=https://api.form.io
[libs.persistence]
  DB_SECRET=changeme
[libs.server.PROJECT_KEYS]
  ; Projects this server is authorized to work with
  ; projectId=apiKey
  ;
  ; 606d0e5c7fa964b2a209fd6b=yL0js0P0aNvd7hpIsBPumXjdz73P2I
```

### Environment Variables

Both the [API Server](/additional-documentation/docker-images-variations/api-server/hub-server.html) and [Submission Server](/additional-documentation/docker-images/api-server-variations/submission-server.html) share the application name `api`. Deployment notes for all images will list their application names

Environment variables are formatted like this: `{app_name}_propA__propB__etc`

```text
api_MONGO=mongodb://mongo:27018/db_name
api_libs__authentication__REMOTE_SECRET=changeme
api_libs__license__LICENSE_KEY=changeme
api_libs__formiosdk__PORTAL_BASE_URL=https://api.form.io
api_libs__persistence__DB_SECRET=changeme
api_libs__server__PROJECT_KEYS__606d0e5c7fa964b2a209fd6b=yL0js0P0aNvd7hpIsBPumXjdz73P2I
```
