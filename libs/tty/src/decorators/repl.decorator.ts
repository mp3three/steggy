import { REPL_CONFIG, ReplOptions } from '@automagical/tty';
import { Injectable } from '@nestjs/common';

export function Repl({
  ...options
}: ReplOptions & { consumesConfig?: string[] }): ClassDecorator {
  return function (target) {
    target[REPL_CONFIG] = options;
    return Injectable()(target);
  };
}
