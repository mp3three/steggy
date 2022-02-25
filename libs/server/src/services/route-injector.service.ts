import { HTTP_METHODS } from '@automagical/utilities';
import { Injectable, RequestMapping, RequestMethod } from '@nestjs/common';

// Conflict between compliler and linter
/* eslint-disable @typescript-eslint/ban-types */

interface MethodInjectOptions<T> {
  /**
   * Force a method into existence if it doesn't exist already.
   * Probably a bad idea to use
   *
   * Use at your own risk. Conceivably useful for standardizing objects to interfaces
   */
  callback?: (...data: unknown[]) => unknown | void | Promise<unknown | void>;
  instance: object;
  method?: HTTP_METHODS | `${HTTP_METHODS}`;
  name: string & keyof T;
  path?: string;
}

@Injectable()
/**
 * Abusing application lifecycles for fun and profit.
 * Programmatically add http routes to methods by setting metadata for nest
 *
 * Only works if used onPreInit
 */
export class RouteInjector {
  public inject<T>({
    name,
    callback,
    instance,
    path,
    method,
  }: MethodInjectOptions<T>): void {
    const proto = instance.constructor.prototype;
    if (!proto[name] && !callback) {
      // pure optional
      return;
    }
    proto[name] ??= callback;
    const descriptors = Object.getOwnPropertyDescriptors(proto);

    let requestMethod: RequestMethod = RequestMethod.ALL;
    switch (method) {
      case HTTP_METHODS.get:
        requestMethod = RequestMethod.GET;
        break;
      case HTTP_METHODS.post:
        requestMethod = RequestMethod.POST;
        break;
      case HTTP_METHODS.delete:
        requestMethod = RequestMethod.DELETE;
        break;
      case HTTP_METHODS.put:
        requestMethod = RequestMethod.PUT;
        break;
      case HTTP_METHODS.options:
        requestMethod = RequestMethod.OPTIONS;
        break;
      case HTTP_METHODS.head:
        requestMethod = RequestMethod.HEAD;
        break;
      case HTTP_METHODS.patch:
        requestMethod = RequestMethod.PATCH;
        break;
    }
    RequestMapping({
      method: requestMethod,
      path: path || `/${name}`,
    })(instance, name, descriptors[name]);
  }
}
