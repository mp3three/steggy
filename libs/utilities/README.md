# @ccontour/utilities

## Purpose

This library provides a varity of general purpose services, annotations, and supporting code for the `@ccontour` repository.
It acts as a catchall for things complicated enough to otherwise deserve their own NPM package, but fails to meet the threshold of a local library.

## Absorbed / Wrapped NPM Packages

> `@ccontour/utiliities` will frequently wrap / replace other NPM libraries that are too awkward to work with or are missing critical functinality
>
> One it's bigger purposes in life is the reduction of external dependencies that require lots of work to integrate.

### [nestjs-pino](https://www.npmjs.com/package/nestjs-pino)

The `AutoLogService` replaces the nestjs-pino library. Notable enhancements:

- Automatic context generation
- Automatic configuration
- Non-http log statements still respect log level
- Annotation based log statements
  - trace logging
  - automatic debug / warnings logs when functions are run
- pino-pretty support
  - custom pretty formatting for development
- Support for non-standard log targets (such as output to Blessed box)
- Nest compatible logger
  - Custom pretty functions to make those messages more readable

### [@nestjs/config](https://www.npmjs.com/package/@nestjs/config)

The `AutoConfigService` replaces the nestjs configuration packages. Notable changes:

- Added a set method
  - Inteded for quick boot time updates to application config, and testing
- Automatic config loading through [rc](https://www.npmjs.com/package/rc)
- Automatic default values

### [nest-mqtt](https://www.npmjs.com/package/nest-mqtt)

MQTT library originally based off nest-mqtt, but the code has significantly diverged internally since.
It provides annotation based binding of mqtt messages, direct subscriptions, automatic health check announcements, and basic publish functionality.

### [@nestjs/schedule](https://www.npmjs.com/package/@nestjs/schedule)

Currently, the nestjs scheduler contains more raw functionality than the local one.
The nestjs scheduler interacts poorly with items such as annotation based logging, and the majority of the functionality was not utilized inside this repository.
If a need for scheduler improvements comes along later, the intent is to add the logic locally instead of returning to the nest scheduler and it's breaking ways

### [@nestjs/event-emitter](https://www.npmjs.com/package/@nestjs/event-emitter)

This library plays poorly with the repo similarly to the way the scheduler does.
There wasn't enough logic in the nest version of the lib to justify keeping it

### [node-fetch](https://www.npmjs.com/package/node-fetch)

`FetchService` acts as a wrapper for node-fetch that can work with nest's DI and can read information out of the config, and a variety of other minor useful features

### [solar-calc](https://www.npmjs.com/package/solar-calc)

`SolarCalcService` acts as a wrapper for the solar calculator library.
Since the NPM library appears abandoned, porting the logic over is somewhere on the TODO list (but not very high right now since the lib is effective at what it does and doesn't have deps)

## Decorators

In addition to the services, this library's primary exports includes a variety of utility decorators for modifying method logic, or use case specific versions of `@Inject`
