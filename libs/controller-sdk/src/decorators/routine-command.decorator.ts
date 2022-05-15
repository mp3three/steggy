import { Injectable } from '@nestjs/common';
import {
  RoutineCommandDTO,
  RoutineCommandSettings,
  RoutineDTO,
} from '@steggy/controller-shared';

export const ROUTINE_COMMAND = Symbol('routine-command');

export function RoutineCommand(
  options: RoutineCommandSettings,
): ClassDecorator {
  return function (target) {
    target[ROUTINE_COMMAND] = options;
    Injectable()(target);
  };
}

export interface iRoutineCommand<TYPE> {
  /**
   * Return true to stop command processing
   */
  activate: (options: {
    command: RoutineCommandDTO<TYPE>;
    routine: RoutineDTO;
    runId: string;
    waitForChange: boolean;
  }) => Promise<boolean | void>;
}
