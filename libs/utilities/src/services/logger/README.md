# Auto Logger

Auto Logger is a logging toolkit for nest that respects the library settings of this repository.
It aims to provide a basic / standardized logging interface, along with supporting annotations for easy logging.

> Auto Logger originally based off the `nestjs-pino`+`express-ctx` projects

## Details

### Context Generation

The context of the log is intended to quickly describe where in the code base the message is originating from.
Each context should be unique to a file, and generated automatically whenever possible.

**Format**: `{library / application name}:{specific logger}`

### Automatic Generation

When the logger is attached to a Nest `@Injectable()` class, context will automattically be created.
The library name is provided at the module which will contain any given `Provider`, and is inherited to all the services.
The specific logger name is based off the class name of the service.

> **Note:** `@InjectLogger()` is required to inject the logger with context as a class property

### Manual Generation

Some files aren't able to work with automatic generation/nest DI.
The static `AutoLogService.call` method takes in the context as a parameter.
Below is an exmaple call:

```typescript
AutoLogService.call(
  'debug',
  `${LIB_AWESOME.description}:folder/filename`,
  { data },
  'What is this data?'
);
```

## Annotations

### Annotation Order

The order of annotations matters when being applied to a function, with the execution order being top down.
This becomes important when combining logging annotation with annotations that execute the function (ex: `@OnEvent`,`@Cron`)
The logging annotations should always be those closest to the method definition (bottom of the annotation list) to ensure log messages are always emitted.

### `@Trace()`

This method emits a message both before and after a function is called.
It is most useful for debugging issues on deployed containers, and other non-development situations where you could want extremely verbose logs

While not active, this annotation should not have any performance impact.
It is not recommended to run with trace logging turned on in production environments.

### `@Debug()`

Emit a debug log message prior to executing the method. Optionally with a custom message

```typescript
@Debug('Custom Message')
```

### `@Warn()`

Emit a warning message prior to executing the method. Optionally with a custom message

```typescript
@Warn('Custom Message')
```

> Intended for situations where you want to call extra attention to a function being called
>
> Ex: admin login, special functions, etc

## TODO

### Future Expansion

Support for logging inside blessed projects

### Known Issues

- Nest logger doesn't properly respect log level on bootstrap
