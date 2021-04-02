import {
  EntityService,
  HassDomains,
  HomeAssistantService,
  iEntity,
  SocketService,
  SwitchEntity,
} from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';
import * as cron from 'node-cron';
import { MobileDevice, NotificationGroup } from '../../typings';

type MilageHistory = {
  attributes: {
    friendly_name: string;
    icon: string;
    unit_of_mesurement: string;
  };
  entity_id: string;
  last_changed: string;
  last_updated: string;
  state: string;
};
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
    private readonly homeAssistantService: HomeAssistantService,
    private readonly entityService: EntityService,
    private readonly socketService: SocketService,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async configureEsp(macAddress: string): Promise<MqttResponse> {
    this.logger.info(`configureEsp: ${macAddress}`);
    return {
      topic: `${macAddress}/configure/entity-id`,
      payload: HomeAssistantService.ESPMapping[macAddress],
    };
  }

  public async getMystiqueMilageHistory(
    entity_id: string,
  ): Promise<Record<string, unknown>[]> {
    const history = await this.socketService.fetchEntityHistory<
      MilageHistory[][]
    >(7, entity_id);
    const dayMilage = {};
    if (!history || history.length === 0) {
      return;
    }
    history[0].forEach((history: MilageHistory) => {
      const d = dayjs(history.last_changed).endOf('d');
      const timestamp = d.format('YYYY-MM-DD');
      dayMilage[timestamp] = dayMilage[timestamp] || 0;
      const miles = Number(history.state);
      if (miles > dayMilage[timestamp]) {
        dayMilage[timestamp] = miles;
      }
    });
    return Object.keys(dayMilage)
      .sort((a, b) => {
        if (a > b) {
          return 1;
        }
        return -1;
      })
      .map((date) => {
        return {
          date,
          miles: Math.floor(dayMilage[date]),
        };
      });
  }

  // protected async loadRoomConfig(): Promise<BaseRoomConfigDTO> {
  //   const configPath = join(
  //     this.configService.get('application.CONFIG_PATH'),
  //     `${this.roomCode}.yaml`,
  //   );
  //   this.roomConfig = yaml.load(readFileSync(configPath, 'utf8')) as {
  //     config: Record<string, unknown>;
  //   };
  //   return this.roomConfig;
  // }
  public onModuleInit(): void {
    this.batteryMonitor();
    this.doorMonitor();
    this.adguardMonitor();
    this.onSocketReset();
    this.logger.info(
      `${this.configService.get('NODE_ENV')} cron started at: ${dayjs().format(
        'YYYY-MM-DD HH:mm:ss',
      )}`,
    );
    // HomeAssistantService.frontDoorLock = await this.entityService.byId(
    //   'lock.front_door',
    // );
    // HomeAssistantService.backDoorLock = await this.entityService.byId(
    //   'lock.front_door',
    // );
    // if (HomeAssistantService.ESPMapping === null) {
    //   const configPath = join(
    //     this.configService.get('application.CONFIG_PATH'),
    //     'esp-mapping.json',
    //   );
    //   HomeAssistantService.ESPMapping = JSON.parse(
    //     readFileSync(configPath, 'utf-8'),
    //   );
    // }
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
        this.logger.warning(
          `Adguard is currently disabled, re-enabling in an hour`,
        );
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
