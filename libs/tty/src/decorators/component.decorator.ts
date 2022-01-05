import { Injectable } from '@nestjs/common';

import { tKeyMap } from './inquirer.decorator';

export const COMPONENT_CONFIG = Symbol('editor');

export interface ComponentOptions {
  type: string;
}

export function Component(options: ComponentOptions): ClassDecorator {
  return function (target) {
    target[COMPONENT_CONFIG] = options;
    return Injectable()(target);
  };
}
export interface iComponent<ACTIVE_CONFIG = unknown, VALUE_TYPE = unknown> {
  configure(config: ACTIVE_CONFIG, done: (type: VALUE_TYPE) => void): void;
}
