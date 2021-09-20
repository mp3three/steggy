import { AutoLogService, InjectLogger } from '@automagical/utilities';
import { Injectable, Scope } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  iKunamiService,
  iRoomController,
  KunamiCommandDTO,
} from '../contracts';
import { RoomSettings } from '../includes/room-settings';

/**
 * For the tracking of multiple button press sequences on remotes
 */
@Injectable({ scope: Scope.TRANSIENT })
export class KunamiCodeService implements iKunamiService {
  private readonly room: iRoomController;

  private callbacks = new Set<KunamiCommandDTO>();
  private codes: ControllerStates[];
  private timeout: ReturnType<typeof setTimeout>;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectLogger()
    private readonly logger: AutoLogService,
  ) {}

  public addCommand(command: KunamiCommandDTO): void {
    this.logger.debug(
      `[${RoomSettings(this.room).friendlyName}] Added command {${
        command.name
      }}`,
    );
    this.callbacks.add(command);
  }

  protected onApplicationBootstrap(): void {
    this.codes = [];
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(RoomSettings(this.room).remote, '*'),
      (state: ControllerStates) => {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.codes.push(state);
        this.timeout = setTimeout(() => {
          this.timeout = undefined;
          this.codes = [];
        }, 1500);
        this.findMatches();
      },
    );
  }

  private compare(a: ControllerStates[], b: ControllerStates[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((code, index) => b[index] === code);
  }

  private findMatches(): void {
    const fullCodes = this.codes;
    const partialCodes = this.codes.filter(
      (code) => code !== ControllerStates.none,
    );
    this.callbacks.forEach((kunamiCode) => {
      const { callback, activate } = kunamiCode;
      if (activate.ignoreRelease) {
        if (this.codes[this.codes.length - 1] !== ControllerStates.none) {
          return;
        }
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
}
