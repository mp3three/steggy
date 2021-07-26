import {
  APP_HOME_CONTROLLER,
  CONNECTION_RESET,
} from '@automagical/contracts/constants';
import {
  domain,
  HASS_DOMAINS,
  HassEventDTO,
  HomeAssistantRoomConfigDTO,
  split,
} from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HACallService,
  HASocketAPIService,
  HomeAssistantCoreService,
  NotifyDomainService,
} from '@automagical/home-assistant';
import { InjectLogger, sleep, SolarCalcService } from '@automagical/utilities';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ApplicationService {
  // #region Object Properties

  // private logger = Logger(AppService);
  private sendDoorNotificationTimeout = {};

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(ApplicationService, APP_HOME_CONTROLLER)
    protected readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly solarCalc: SolarCalcService,
    private readonly notifyService: NotifyDomainService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Cron('0 0 11 * * *')
  protected async dayInfo(): Promise<void> {
    this.logger.debug(`dayInfo`);
    const { SOLAR_CALC } = this.solarCalc;
    const start = dayjs(SOLAR_CALC.goldenHourStart).format('hh:mm');
    const end = dayjs(SOLAR_CALC.goldenHourEnd).format('hh:mm');
    const message = `🌄 ${dayjs().format('ddd MMM DD')}: ${start} - ${end}`;
    await this.notifyService.notify(message);
    // this.homeAssistantService.sendNotification(
    //   MobileDevice.generic,
    //   message,
    //   NotificationGroup.environment,
    // );
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Cron('0 0 11 * * Wed,Sat')
  private async batteryMonitor() {
    // const entities = this.entityService.entityList().filter((entityId) => {
    //   const [domain, suffix] = split(entityId);
    //   return domain !== HASS_DOMAINS.sensor || !suffix.includes('battery');
    // });
    // entities.forEach(async (item) => {
    //   const entity = await this.entityService.byId(item);
    //   const pct = Number(entity.state);
    //   if (pct < 10) {
    //     this.homeAssistantService.sendNotification(
    //       MobileDevice.generic,
    //       `${entity.attributes.friendly_name} is at ${entity.state}%`,
    //       NotificationGroup.environment,
    //     );
    //   }
    // });
  }

  @OnEvent([CONNECTION_RESET])
  private async onSocketReset() {
    this.logger.debug('onSocketReset');
    await sleep(10000);
    // await this.socketService.call(
    //   MobileDevice.generic,
    //   {
    //     data: {
    //       push: {
    //         'thread-id': NotificationGroup.serverStatus,
    //       },
    //     },
    //     message: `Connection reset at ${new Date().toISOString()}`,
    //     title: `core temporarily lost connection with HomeAssistant`,
    //   },
    //   HASS_DOMAINS.notify,
    // );
  }

  // #endregion Private Methods
}
