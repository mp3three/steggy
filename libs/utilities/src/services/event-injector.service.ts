import { applyDecorators, Injectable } from '@nestjs/common';

// Conflict between compliler and linter
/* eslint-disable @typescript-eslint/ban-types */

interface MethodInjectOptions<T> {
  name: string & keyof T;
  instance: object;
  path?: string;
}
@Injectable()
export class EventInjectorService {
  public inject<T>({ name, instance, path }: MethodInjectOptions<T>): void {
    const proto = instance.constructor.prototype;
    const descriptors = Object.getOwnPropertyDescriptors(proto);

    applyDecorators()(instance, name, descriptors[name]);
    //
  }
}
