import { AutoLogService, InjectLogger } from '@automagical/utilities';
import { Injectable, Scope } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  iRoomController,
  KunamiCommandDTO,
} from '../contracts';
import { RoomSettings } from '../includes/room-settings';

/**
 * For the tracking of multiple button press sequences on remotes
 */
@Injectable()
export class KunamiCodeService {
  private callbacks = new Map<string, Set<KunamiCommandDTO>>();
  private codes = new Map<string, ControllerStates[]>();
  private timeout: ReturnType<typeof setTimeout>;
  private boundControllers = new Set<string>();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectLogger()
    private readonly logger: AutoLogService,
  ) {}

  public addCommand(room: iRoomController, command: KunamiCommandDTO): void {
    const { name, friendlyName, remote } = RoomSettings(room);
    this.logger.debug(`[${friendlyName}] Added command {${command.name}}`);
    if (!this.callbacks.has(name)) {
      this.callbacks.set(name, new Set());
      this.codes.set(name, []);
    }
    this.callbacks.get(name).add(command);

    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(remote, '*'),
      (state: ControllerStates) => {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.codes.get(name).push(state);
        this.timeout = setTimeout(() => {
          this.timeout = undefined;
          this.codes.set(name, []);
        }, 1500);
        this.findMatches(name);
      },
    );
  }

  private compare(a: ControllerStates[], b: ControllerStates[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((code, index) => b[index] === code);
  }

  private findMatches(name: string): void {
    const fullCodes = this.codes.get(name);
    const partialCodes = this.codes
      .get(name)
      .filter((code) => code !== ControllerStates.none);
    this.callbacks.get(name).forEach((kunamiCode) => {
      const { callback, activate } = kunamiCode;
      if (activate.ignoreRelease) {
        if (
          this.codes[this.codes.get(name).length - 1] !== ControllerStates.none
        ) {
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
