import { Injectable } from '@nestjs/common';

import { REPL_CONFIG, ReplOptions } from '../contracts';

export function Repl(options: ReplOptions): ClassDecorator {
  return function (target) {
    target[REPL_CONFIG] = options;
    return Injectable()(target);
  };
}
