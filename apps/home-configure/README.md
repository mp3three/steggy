# Home Configuration

Note: This project is **NOT** inteded to be a dashboard. There is no persistent connection open from the UI to the backend, nor to Home Assistant. The UI may not always match actual entity state.
It serves as the frontend to the `home-controller` application, providing a webui to manage the way the controller works.

## Usage

### Deployed

When deploying `home-controller` as a docker container, no additional work needs to be done. This app comes with the image, and will be automatically served as the web interface

### Development

During development, the webpack dev server is run separately from the controller.
The development build of the controller is set up to proxy requests through to this webpack server, acting the same as the production builds.

```bash
# Start the dev server
npx nx serve home-configure
```

### Standalone UI, targeting a different controller

The development webpack dev server can have the pages loaded directly.
Under the settings panel, there is an option attached to the same section as the admin key, which can be used to point the UI to a custom base url
