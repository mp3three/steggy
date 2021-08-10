import type {
  iKunamiService,
  iRoomController,
} from '@automagical/contracts/controller-logic';
import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  KunamiCommandDTO,
} from '@automagical/contracts/controller-logic';
import { AutoLogService, InjectLogger } from '@automagical/utilities';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { RoomSettings } from '../includes/room-settings';

/**
 * For the tracking of multiple button press sequences on remotes
 */
@Injectable({ scope: Scope.TRANSIENT })
export class KunamiCodeService implements iKunamiService {
  // #region Object Properties

  private callbacks = new Set<KunamiCommandDTO>();
  private codes: ControllerStates[];
  private timeout: ReturnType<typeof setTimeout>;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(INQUIRER) private readonly room: iRoomController,
    private readonly eventEmitter: EventEmitter2,
    @InjectLogger()
    private readonly logger: AutoLogService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public addCommand(command: KunamiCommandDTO): void {
    this.logger.debug(
      `[${RoomSettings(this.room).friendlyName}] Added Command {${
        command.name
      }}`,
    );
    this.callbacks.add(command);
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
        this.findMatches();
      },
    );
  }

  // #endregion Protected Methods

  // #region Private Methods

  private compare(a: ControllerStates[], b: ControllerStates[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((code, index) => b[index] === code);
  }

  private findMatches(): void {
    const fullCodes = this.codes;
    const partialCodes = this.codes.filter(
      (code) => code !== ControllerStates.off,
    );
    this.callbacks.forEach((kunamiCode) => {
      const { callback, activate } = kunamiCode;
      if (activate.ignoreRelease) {
        if (!this.compare(partialCodes, activate?.states || [])) {
          return;
        }
        return callback({ events: partialCodes });
      }
      if (!this.compare(fullCodes, activate?.states || [])) {
        return;
      }
      callback({ events: fullCodes });
    });
  }

  // #endregion Private Methods
}
