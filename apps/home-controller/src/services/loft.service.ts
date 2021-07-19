import { RoomController } from '@automagical/contracts';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { PicoStates } from '@automagical/contracts/home-assistant';
import { LutronPicoService } from '@automagical/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { ROOM_NAMES } from '../typings';

@Injectable()
export class LoftService implements RoomController {
  // #region Object Properties

  public controller = {
    lights: [],
    switch: [],
  };
  public name = ROOM_NAMES.loft;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(LoftService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
    private readonly picoService: LutronPicoService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async areaOn(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async combo(actions: PicoStates[]): Promise<boolean> {
    return true;
  }

  @Trace()
  public async dimDown(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async dimUp(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async favorite(): Promise<void> {
    return;
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected onModuleInit(): void {
    this.picoService.setRoomController('', this);
  }

  // #endregion Protected Methods
}
