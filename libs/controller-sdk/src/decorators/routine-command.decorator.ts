import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { RoutineCommandDTO, RoutineDTO } from '@steggy/controller-shared';

export const ROUTINE_COMMAND = Symbol('routine-command');

export class RoutineCommandSettings {
  @ApiProperty()
  public description: string;
  @ApiProperty()
  public name: string;
  @ApiProperty()
  public syncOnly?: boolean;
  @ApiProperty()
  public type: string;
}

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
