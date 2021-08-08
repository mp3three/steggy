import { iRoomController } from '@automagical/contracts';
import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  HiddenService,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { AutoLogService, InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, Scope } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * For the tracking of multiple button press sequences on remotes
 */
@Injectable({ scope: Scope.TRANSIENT })
export class KunamiCodeService implements HiddenService {
  // #region Object Properties

  public controller: Partial<iRoomController>;
  public settings: RoomControllerSettingsDTO;

  private readonly callbacks = new Map<
    ControllerStates[],
    (code: ControllerStates[]) => void
  >();

  private code: ControllerStates[] = [];
  private timeout: ReturnType<typeof setTimeout>;

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly eventEmitter: EventEmitter2) {
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

  @Trace()
  public async init(): Promise<void> {
    if (!this.settings.remote) {
      return;
    }
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(this.settings.remote, '*'),
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

  public addMatch(match: ControllerStates[], callback: () => void): void {
    this.callbacks.set(match, callback);
  }

  // #endregion Public Methods

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
