import { CONNECTION_RESET } from '@automagical/contracts/constants';
import {
  HassDomains,
  HassEventDTO,
  HomeAssistantRoomConfigDTO,
} from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  RoomService,
  SocketService,
} from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { sleep } from '@automagical/utilities';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import * as dayjs from 'dayjs';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ASSETS_PATH } from '../../environments/environment';
import { MobileDevice, NotificationGroup, RoomsCode } from '../../typings';

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
  // #region Object Properties

  private logger = Logger(AppService);
  private sendDoorNotificationTimeout = {};

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly homeAssistantService: HomeAssistantService,
    private readonly entityService: EntityService,
    private readonly socketService: SocketService,
    private readonly roomService: RoomService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async getCarMilageHistory(
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
      const timestamp = dayjs(history.last_changed)
        .endOf('d')
        .format('YYYY-MM-DD');
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

  public async loadRoomConfig(
    room: RoomsCode,
  ): Promise<HomeAssistantRoomConfigDTO> {
    const cacheName = `${room}/config`;
    const cachedValue = await this.cacheService.get<HomeAssistantRoomConfigDTO>(
      cacheName,
    );
    if (cachedValue) {
      return cachedValue;
    }
    const root = this.configService.get(ASSETS_PATH);
    const text = readFileSync(join(root, `${room}.yaml`), 'utf-8');
    const config = load(text) as HomeAssistantRoomConfigDTO;
    return this.cacheService.set(cacheName, config);
  }

  // #endregion Public Methods

  // #region Private Methods

  @Cron('0 0 11 * * Wed,Sat')
  private async batteryMonitor() {
    this.logger.info('Watch: Battery');
    await this.socketService.updateAllEntities();
    await sleep(1000);
    const entities = this.entityService.listEntities().filter((entityId) => {
      const [domain, suffix] = entityId.split('.');
      return (
        (domain as HassDomains) !== HassDomains.sensor ||
        !suffix.includes('battery')
      );
    });

    entities.forEach(async (item) => {
      const entity = await this.entityService.byId(item);
      const pct = Number(entity.state);
      if (pct < 10) {
        this.homeAssistantService.sendNotification(
          MobileDevice.generic,
          `${entity.attributes.friendly_name} is at ${entity.state}%`,
          NotificationGroup.environment,
        );
      }
    });
  }

  @Cron('0 0 11 * * *')
  private dayInfo() {
    const cal = this.roomService.SOLAR_CALC;
    const start = dayjs(cal.goldenHourStart).format('hh:mm');
    const end = dayjs(cal.goldenHourEnd).format('hh:mm');
    const message = `🌄 ${dayjs().format('ddd MMM DD')}: ${start} - ${end}`;
    this.homeAssistantService.sendNotification(
      MobileDevice.generic,
      message,
      NotificationGroup.environment,
    );
    // this.logger.notice(message);
  }

  @OnEvent(CONNECTION_RESET)
  private async onSocketReset() {
    await sleep(1000);
    this.socketService.call(HassDomains.notify, MobileDevice.generic, {
      message: `Connection reset at ${new Date().toISOString()}`,
      title: `core temporarily lost connection with HomeAssistant`,
      data: {
        push: {
          'thread-id': NotificationGroup.serverStatus,
        },
      },
    });
  }

  /**
   * Watch binary sensors w/ "door" in the name for changes.
   * Notify on change.
   */
  @OnEvent(`*/update`)
  private sendDoorNotification(event: HassEventDTO) {
    const [domain, suffix] = event.data.entity_id.split('.');
    if (
      (domain as HassDomains) !== HassDomains.binary_sensor ||
      !suffix.includes('door')
    ) {
      return;
    }
    if (this.sendDoorNotificationTimeout) {
      clearTimeout(this.sendDoorNotificationTimeout[event.data.entity_id]);
    }
    this.sendDoorNotificationTimeout[event.data.entity_id] = setTimeout(() => {
      this.homeAssistantService.sendNotification(
        MobileDevice.generic,
        `${event.data.entity_id} is now ${
          event.data.new_state === 'on' ? 'closed' : 'open'
        }`,
        NotificationGroup.door,
      );
      this.sendDoorNotificationTimeout[event.data.entity_id] = null;
    }, 250);
  }

  // #endregion Private Methods
}
