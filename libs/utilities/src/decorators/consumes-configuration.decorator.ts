import { CONSUMES_CONFIG } from '@automagical/contracts/utilities';
import { Injectable, ScopeOptions } from '@nestjs/common';

export function ConsumesConfig(
  config: string[],
  scope?: ScopeOptions,
): ClassDecorator {
  return function (target) {
    target[CONSUMES_CONFIG] = config;
    return Injectable(scope)(target);
  };
}
