import { iRoomController } from '@automagical/contracts';
import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
} from '@automagical/contracts/controller-logic';
import { Inject, Injectable } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';

const timeouts = new Map<
  string,
  {
    timeout: ReturnType<typeof setTimeout>;
    codes: ControllerStates[];
  }
>();
/**
 * For the tracking of multiple button press sequences on remotes
 */
@Injectable()
export class KunamiCodeService {
  // #region Constructors

  constructor(
    @Inject(INQUIRER)
    private readonly controller: Partial<iRoomController>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public addMatch(
    remote: string,
    callbacks: Map<ControllerStates[], () => void>,
  ): void {
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(remote, '*'),
      (state: ControllerStates) => {
        let codes = [];
        if (timeouts.has(remote)) {
          clearTimeout(timeouts.get(remote).timeout);
          codes = timeouts.get(remote).codes;
        }
        codes.push(state);
        timeouts.set(remote, {
          codes,
          timeout: setTimeout(() => {
            timeouts.delete(remote);
          }, 1500),
        });
        const size = codes.length;
        callbacks.forEach((callback, states) => {
          if (size !== states.length) {
            return;
          }
          const matches = states.every((item, index) => {
            return codes[index] === item;
          });
          if (!matches) {
            return;
          }
          callback();
        });
      },
    );
  }

  // #endregion Public Methods
}
