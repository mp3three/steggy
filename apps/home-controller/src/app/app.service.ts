import {
  EntityService, HassDomains, HomeAssistantService, iEntity, SocketService, SwitchEntity
} from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as cron from 'node-cron';
import { MobileDevice, NotificationGroup } from '../../typings';

@Injectable()
export class AppService {
  // #region Static Properties

  private static readonly BATTERY_WATCH_LIST = [
    'sensor.back_door_battery',
    'sensor.front_door_battery',
  ];
  private static readonly DOOR_WATCH_LIST = {
    'binary_sensor.garage_door_state': 'Garage Door',
    'binary_sensor.front_door_open': 'Front Door',
    'binary_sensor.back_door_open': 'Back Door',
  };

  // #endregion Static Properties

  // #region Object Properties

  private logger = Logger(AppService);
  private sendDoorNotificationTimeout = {};

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private homeAssistantService: HomeAssistantService,
    private entityService: EntityService,
    private socketService: SocketService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public onModuleInit() {
    this.batteryMonitor();
    this.doorMonitor();
    this.adguardMonitor();
      this.onSocketReset();
    this.logger.info(
      `${process.env.NODE_ENV} cron started at: ${dayjs().format(
        'YYYY-MM-DD HH:mm:ss',
      )}`,
    );
  }

  // #endregion Public Methods

  // #region Private Methods

  private async adguardMonitor() {
    this.logger.info(`Watch: Adguard`);
    const adguard = await this.entityService.byId<SwitchEntity>(
      'switch.adguard_protection',
    );
    let deactivatedSince: dayjs.Dayjs = null;
    cron.schedule('0 */15 * * *', async () => {
      if (adguard.state !== 'off') {
        return;
      }
      if (deactivatedSince === null) {
        this.logger.warning(`Adguard is currently disabled, re-enabling in an hour`);
        deactivatedSince = dayjs();
        return;
      }
      if (deactivatedSince.isBefore(dayjs().subtract(1, 'hour'))) {
        await adguard.turnOn();
        this.homeAssistantService.sendNotification(
          MobileDevice.generic,
          `Adguard was automatically re-enabled`,
          NotificationGroup.serverStatus,
        );
        deactivatedSince = null;
      }
    });
  }

  private async batteryMonitor() {
    this.logger.info('Watch: Battery');
    cron.schedule('0 0 11 * * Wed,Sat', () => {
      AppService.BATTERY_WATCH_LIST.forEach(async (item) => {
        const entity = await this.entityService.byId(item);
        const pct = Number(entity.state);
        if (pct < 10) {
          this.homeAssistantService.sendNotification(
            MobileDevice.generic,
            `${entity.attributes.friendly_name} is at ${entity.state}%`,
            NotificationGroup.battery,
          );
        }
      });
    });
  }

  private doorMonitor() {
    this.logger.info('Watch: Door');
    Object.keys(AppService.DOOR_WATCH_LIST).forEach(async (entityId) => {
      const entity = await this.entityService.byId(entityId);
      entity.on('update', () => this.sendDoorNotification(entity));
    });
  }

  private onSocketReset() {
    this.socketService.on('connection-reset', () => {
      setTimeout(() => {
        this.socketService.call(HassDomains.notify, MobileDevice.generic, {
          message: `Connection reset at ${new Date().toISOString()}`,
          title: `core temporarily lost connection with HomeAssistant`,
          data: {
            push: {
              'thread-id': NotificationGroup.serverStatus,
            },
          },
        });
      }, 1000);
    });
  }

  private sendDoorNotification(entity: iEntity) {
    if (this.sendDoorNotificationTimeout) {
      clearTimeout(this.sendDoorNotificationTimeout[entity.entityId]);
    }
    this.sendDoorNotificationTimeout[entity.entityId] = setTimeout(() => {
      this.homeAssistantService.sendNotification(
        MobileDevice.generic,
        `${AppService.DOOR_WATCH_LIST[entity.entityId]} is now ${
          entity.state === 'on' ? 'closed' : 'open'
        }`,
        NotificationGroup.door,
      );
      this.sendDoorNotificationTimeout[entity.entityId] = null;
    }, 250);
  }

  // #endregion Private Methods
}
