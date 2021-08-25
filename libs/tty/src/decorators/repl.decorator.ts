import { REPL_CONFIG, ReplOptions } from '@automagical/contracts/tty';
import { CONSUMES_CONFIG } from '@automagical/contracts/utilities';
import { Injectable } from '@nestjs/common';

export function Repl({
  consumesConfig,
  ...options
}: ReplOptions & { consumesConfig?: string[] }): ClassDecorator {
  return function (target) {
    if (consumesConfig) {
      target[CONSUMES_CONFIG] = consumesConfig;
    }
    target[REPL_CONFIG] = options;
    return Injectable()(target);
  };
}
