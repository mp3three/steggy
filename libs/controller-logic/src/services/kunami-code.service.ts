import type {
  iKunamiService,
  iRoomController,
} from '@automagical/contracts/controller-logic';
import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  KunamiCommandDTO,
} from '@automagical/contracts/controller-logic';
import { AutoLogService } from '@automagical/utilities';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * For the tracking of multiple button press sequences on remotes
 */
@Injectable({ scope: Scope.TRANSIENT })
export class KunamiCodeService implements iKunamiService {
  // #region Object Properties

  private callbacks = new Map<
    ControllerStates[],
    (states: ControllerStates[]) => void
  >();
  private codes: ControllerStates[];
  private timeout: ReturnType<typeof setTimeout>;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(INQUIRER) private readonly room: iRoomController,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AutoLogService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public addCommand(command: KunamiCommandDTO): void {
    //
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected onApplicationBootStrap(): void {
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT('this.room', '*'),
      (state: ControllerStates) => {
        this.logger.warn({ state });
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.codes.push(state);
        this.logger.debug({ codes: this.codes }, 'added');
        this.timeout = setTimeout(() => {
          this.timeout = undefined;
        }, 1500);
        const size = this.codes.length;
        this.callbacks.forEach((callback, states) => {
          if (size !== states.length) {
            return;
          }
          const matches = states.every((item, index) => {
            return this.codes[index] === item;
          });
          if (!matches) {
            return;
          }
          callback(this.codes);
        });
      },
    );
  }

  // #endregion Protected Methods
}
