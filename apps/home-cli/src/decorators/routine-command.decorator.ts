import { Injectable } from '@nestjs/common';

export interface iRoutineCommandOptions {
  type: string;
}

export const ROUTINE_COMMAND = Symbol();

export function RoutineCommand(
  options: iRoutineCommandOptions,
): ClassDecorator {
  return function (target) {
    target[ROUTINE_COMMAND] = options;
    Injectable()(target);
  };
}
export interface iRoutineCommand {
  build: () => void;
}
