export class CustomCommandOptions {
  public description: string;
  public friendlyName: string;
}

export type tCustomCommandMapItem = {
  descriptor: TypedPropertyDescriptor<unknown>;
  options: CustomCommandOptions;
  property: string;
  target: Record<string, unknown>;
};

export type tCustomCommandMap = Map<
  CustomCommandOptions,
  tCustomCommandMapItem
>;

export const CUSTOM_COMMAND = Symbol('CUSTOM_COMMAND');
export function CustomCommand(options: CustomCommandOptions): MethodDecorator {
  return function (target, property: string, descriptor) {
    const commands: tCustomCommandMap = target[CUSTOM_COMMAND] ?? new Map();
    commands.set(options, {
      descriptor,
      options,
      property,
      target: target as Record<string, unknown>,
    });
    target.constructor[CUSTOM_COMMAND] = commands;
  };
}
