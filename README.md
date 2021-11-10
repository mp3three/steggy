# @automagical

## Installing

### Installing NodeJS

Development is done against node 16. [Node Version Manager](https://github.com/nvm-sh/nvm) is great for managing node versions if you need to install / change versions. After following the setup instructions, these 2 commands can be used to install a valid version

```bash
nvm install 16 --lts
nvm use 16
```

If you don't already have `yarn` installed (or are doing a first install of nodejs), this step is also needed

```bash
npm install -g yarn
```

### Developer Install

Pull down the code, and install dependencies.

> Note: dependencies are updated frequently. `yarn` should be ran after every pull to stay up to date

```bash
git clone https://github.com/ccontour/automagical
cd automagical
yarn
```

MongoDB is required at this point, and Redis is recommended. If these are not currently installed on your system, they can be installed via docker using the below command

```bash
docker-compose -f ./tools/selfhosted/databases.docker-compose.yaml up -d
```

### Configuration

Configuration is best done via ini files placed at these locations (no file extension).

- **Home Controller**: `~/.config/home-controller`
- **Home CLI**: `~/.config/home-cli`

Example Home Controller configuration:

```ini
[libs.home-assistant]
BASE_URL=http://localhost:8123
TOKEN=<HOMEASSISTANT AUTH TOKEN>

[libs.utilities]
CACHE_PROVIDER=redis
LOG_LEVEL=debug

[libs.server]
ADMIN_KEY=super secret key
```

Example CLI configuration

```ini
[libs.utilities]
LOG_LEVEL=debug

[application]
ADMIN_KEY=super secret key
```

The `ADMIN_KEY` must be matched on each side to allow access. The controller can also be set up to allow unauthenticated requests, with additional authentication mechanisms on the drawing board.

For a full list of all applicable configuration variables, and a more guided configuration experience:

- `yarn configure:home-controller`
- `yarn configure:home-cli`

## Launching

- `yarn dev:home-controller`
- `yarn dev:home-cli`

> Note: Terminals with true color support are best. Also recommend installing a font with emoji support
>
> Any terminal without color support at all may cause the home controller to fall back to pure json logging (instead of the default pretty logger)

The CLI doesn't perform any startup calls (currently) to the controller, so these may be started in either order

### Development

- VSCode + extensions
  - ESLint
  - Prettier
  - Nx Console
  - (optional): Material Icon Theme

The included vscode workspace file (`automagical.code-workspace`) provides editor bindings for configuration files, and json schema definitions.
Code is formatted using a combination of heavy handed linting rules, and prettier.
Nx provides coordination, with all `serve` / `build` / `lint` commands being available through the console.

Current settings for the Material Icons theme extension is stored in `/material-icons.json`

## Extra Notes

### Port Reservations

> Ports used by this repo, and what for

| Port | Item |
| --- | --- |
| 33334 | NodeJS Debugger: Home Controller |
| 33335 | NodeJS Debugger: Dashboard |
| 33336 | NodeJS Debugger: Devtools |
| 33337 | NodeJS Debugger: Home CLI |
| 7000 | Home Controller (default http port) |
