import { applyDecorators, Injectable } from '@nestjs/common';

// Conflict between compliler and linter
/* eslint-disable @typescript-eslint/ban-types */

interface MethodInjectOptions<T> {
  instance: object;
  name: string & keyof T;
  path?: string;
}
@Injectable()
export class EventInjectorService {
  public inject<T>({ name, instance }: MethodInjectOptions<T>): void {
    const proto = instance.constructor.prototype;
    const descriptors = Object.getOwnPropertyDescriptors(proto);

    applyDecorators()(instance, name, descriptors[name]);
    //
  }
}
