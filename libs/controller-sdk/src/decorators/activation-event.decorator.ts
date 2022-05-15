import { Injectable } from '@nestjs/common';
import {
  ActivationEventSettings,
  ROUTINE_ACTIVATE_TYPES,
  RoutineActivateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';

export const ACTIVATION_EVENT = Symbol('activation-event');

export function ActivationEvent(
  options: ActivationEventSettings,
): ClassDecorator {
  return function (target) {
    target[ACTIVATION_EVENT] = options;
    Injectable()(target);
  };
}

export interface iActivationEvent<ACTIVATE = ROUTINE_ACTIVATE_TYPES> {
  /**
   * Remove all the activation events for a single routine
   */
  clearRoutine: (routine: RoutineDTO) => void;

  /**
   * Full cleanup and reset
   */
  reset: () => void;

  /**
   * Mount a single activation event
   */
  watch: (
    routine: RoutineDTO,
    activate: RoutineActivateDTO<ACTIVATE>,
    callback: () => Promise<void>,
  ) => void;
}
