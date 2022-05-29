import { Injectable } from '@nestjs/common';
import { RoutineDTO } from '@steggy/controller-shared';

export const ROUTINE_ENABLED_PROVIDER = Symbol('ROUTINE_ENABLED_PROVIDER');
export class RoutineEnabledOptions {
  public type: string[];
}
export interface iRoutineEnabled<COMPARISON> {
  watch(comparison: COMPARISON, routine: RoutineDTO): void;
}

export function RoutineEnabled(options: RoutineEnabledOptions): ClassDecorator {
  return function (target) {
    target[ROUTINE_ENABLED_PROVIDER] = options;
    return Injectable()(target);
  };
}
