import { iComponent } from '../decorators';

export class ApplicationStackItem {
  application: iComponent;
  title: string;
}

export interface iStackProvider {
  load(item: ApplicationStackItem): void;
  save(): Partial<ApplicationStackItem>;
}
export const STACK_PROVIDER = Symbol('stack-provider');

export function ApplicationStackProvider(): ClassDecorator {
  return function (target) {
    target[STACK_PROVIDER] = true;
  };
}
