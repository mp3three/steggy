import { Injectable } from '@nestjs/common';
import { STOP_PROCESSING_TYPE } from '@steggy/controller-shared';

export const ROUTINE_ENABLED_PROVIDER = Symbol('ROUTINE_ENABLED_PROVIDER');

export function RoutineEnabled(type: STOP_PROCESSING_TYPE): ClassDecorator {
  return function (target) {
    target[ROUTINE_ENABLED_PROVIDER] = type;
    return Injectable()(target);
  };
}
