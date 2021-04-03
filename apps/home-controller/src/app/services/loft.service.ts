import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  EntityService,
  HomeAssistantService,
  RemoteEntity,
  RoomCode,
  RoomService,
  TVRoom,
} from '@automagical/home-assistant';
import { schedule } from 'node-cron';
import { Logger } from '@automagical/logger';
import { HueEvent } from '../../typings';
import { ConfigService } from '@nestjs/config';

enum RokuInputs {
  off = 'off',
  windows = 'hdmi2',
  personal = 'hdmi3',
  work = 'hdmi1',
}

@Injectable()
export class LoftService extends TVRoom {
  // #region Static Properties

  private static readonly logger = Logger(LoftService);

  // #endregion Static Properties

  // #region Constructors

  constructor(
    @Inject(forwardRef(() => HomeAssistantService))
    homeAssistantService: HomeAssistantService,
    @Inject(forwardRef(() => RoomService))
    roomService: RoomService,
    @Inject(forwardRef(() => EntityService))
    entityService: EntityService,
    protected readonly configService: ConfigService,
  ) {
    super(RoomCode.loft, {
      homeAssistantService,
      roomService,
      entityService,
      configService,
    });
  }

  // #endregion Constructors

  // #region Protected Methods

  protected async onModuleInit(): Promise<void> {
    await super.onModuleInit();
    const backDeskLight = await this.entityService.byId(
      'switch.back_desk_light',
    );
    schedule('0 0 7 * * *', () => {
      LoftService.logger.info(`Turn off back desk light`);
      backDeskLight.turnOn();
    });

    schedule('0 0 22 * * *', () => {
      LoftService.logger.info(`Turn on back desk light`);
      backDeskLight.turnOff();
    });

    schedule('0 0 5 * * Mon,Tue,Wed,Thu,Fri', () => {
      LoftService.logger.info(`Changing default screen into to work`);
      this.roomConfig.config.roku.defaultChannel = RokuInputs.work;
    });
    schedule('0 0 17 * * Mon,Tue,Wed,Thu,Fri', () => {
      LoftService.logger.info(`Changing default screen into to personal`);
      this.roomConfig.config.roku.defaultChannel = RokuInputs.personal;
    });

    LoftService.logger.info('Configure: Hue Remote');
    const entity = await this.entityService.byId<RemoteEntity>(
      'remote.bedroom_switch',
    );
    entity.on(`hueButtonClick`, (args: HueEvent) => {
      const event = args.buttonEvent.charAt(0);
      const map: { [key: string]: RokuInputs } = {
        '1': RokuInputs.windows,
        '2': RokuInputs.personal,
        '3': RokuInputs.work,
        '4': RokuInputs.off,
      };
      if (!map[event]) {
        LoftService.logger.warning(
          `Could not figure hue event: ${args.buttonEvent}`,
        );
        return;
      }
      this.setRoku(map[event]);
    });
  }

  // #endregion Protected Methods
}
