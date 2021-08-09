import { iRoomController } from '@automagical/contracts';
import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { Trace } from '@automagical/utilities';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * For the tracking of multiple button press sequences on remotes
 */
@Injectable({ scope: Scope.TRANSIENT })
export class KunamiCodeService {
  // #region Object Properties

  private readonly callbacks = new Map<
    ControllerStates[],
    (code: ControllerStates[]) => void
  >();

  private code: ControllerStates[] = [];
  private timeout: ReturnType<typeof setTimeout>;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(INQUIRER)
    private readonly controller: Partial<iRoomController>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.addMatch(
      [
        ControllerStates.on,
        ControllerStates.none,
        ControllerStates.on,
        ControllerStates.none,
      ],
      () => {
        if (!this.controller.areaOn) {
          return;
        }
        this.controller.areaOn(2);
      },
    );
    this.addMatch(
      [
        ControllerStates.off,
        ControllerStates.none,
        ControllerStates.off,
        ControllerStates.none,
      ],
      () => {
        if (!this.controller.areaOff) {
          return;
        }
        this.controller.areaOff(2);
      },
    );
    this.addMatch(
      [
        ControllerStates.favorite,
        ControllerStates.none,
        ControllerStates.favorite,
        ControllerStates.none,
      ],
      () => {
        if (!this.controller.favorite) {
          return;
        }
        this.controller.favorite(2);
      },
    );
  }

  // #endregion Constructors

  // #region Public Methods

  public addMatch(match: ControllerStates[], callback: () => void): void {
    this.callbacks.set(match, callback);
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected async onModuleInit(): Promise<void> {
    const settings: RoomControllerSettingsDTO =
      this.controller.constructor[ROOM_CONTROLLER_SETTINGS];
    if (!settings.remote) {
      return;
    }
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(settings.remote, '*'),
      (state: ControllerStates) => {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
          this.timeout = undefined;
          this.code = [];
        }, 1500);
        this.code.push(state);
        this.match();
      },
    );
  }

  // #endregion Protected Methods

  // #region Private Methods

  private match(): void {
    const size = this.code.length;
    this.callbacks.forEach((callback, list) => {
      if (size !== list.length) {
        return;
      }
      const matches = list.every((item, index) => this.code[index] === item);
      if (!matches) {
        return;
      }
      callback(this.code);
    });
  }

  // #endregion Private Methods
}
