import { iRoomController } from '@automagical/contracts';
import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  HiddenService,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, Scope } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';

/**
 * For the tracking of multiple button press sequences on remotes
 */
@Injectable({ scope: Scope.TRANSIENT })
export class KunamiCodeService implements HiddenService {
  // #region Object Properties

  public controller: Partial<iRoomController>;
  public settings: RoomControllerSettingsDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger() private readonly logger: PinoLogger,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
        this.logger.debug({ state });
        //
      },
    );
    //
  }

  // #endregion Public Methods
}
