import { RequestMapping, RequestMethod } from '@nestjs/common';
import { ROOM_API_COMMAND } from '@steggy/controller-shared';

export class CommandOptions {
  method?: RequestMethod;
  path?: string | RegExp | Array<string | RegExp>;
}
export type CommandData = Map<string, CommandOptions>;

export function ApiCommand(options?: CommandOptions): MethodDecorator {
  options ??= {};
  return function (
    target: unknown,
    key: string,
    descriptor: PropertyDescriptor,
  ) {
    // Attach a route to method
    options.path ??= `/${key}`;
    // @ts-expect-error Nest definitions are incorrect here
    RequestMapping(options)(target, key, descriptor);

    // Register the options for scanning
    const map: CommandData = (target.constructor[ROOM_API_COMMAND] ??=
      new Map());
    map.set(key, options);

    // Done
    return descriptor;
  };
}
