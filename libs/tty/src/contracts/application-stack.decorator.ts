export interface iStackProvider {
  load(item: unknown): void;
  save(): Partial<unknown>;
}
export const STACK_PROVIDER = Symbol('stack-provider');

export function ApplicationStackProvider(): ClassDecorator {
  return function (target) {
    target[STACK_PROVIDER] = true;
  };
}
