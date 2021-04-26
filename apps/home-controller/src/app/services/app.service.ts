import {
  APP_HOME_CONTROLLER,
  CONNECTION_RESET,
} from '@automagical/contracts/constants';
import {
  domain,
  HassDomains,
  HassEventDTO,
  HassServices,
  HomeAssistantRoomConfigDTO,
  split,
} from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  AreaService,
  SocketService,
} from '@automagical/home-assistant';
import { InjectLogger, sleep } from '@automagical/utilities';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { PinoLogger } from 'nestjs-pino';
import { join } from 'path';
import { ASSETS_PATH } from '../../environments/environment';
import { MobileDevice, NotificationGroup, RoomsCode } from '../../typings';
enum LoftRokuInputs {
  off = 'off',
  windows = 'hdmi2',
  personal = 'hdmi3',
  work = 'hdmi1',
}
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

  // private logger = Logger(AppService);
  private sendDoorNotificationTimeout = {};

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly homeAssistantService: HomeAssistantService,
    private readonly entityService: EntityService,
    private readonly socketService: SocketService,
    private readonly roomService: AreaService,
    @InjectLogger(AppService, APP_HOME_CONTROLLER)
    protected readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async getCarMilageHistory(
    entity_id: string,
  ): Promise<Record<string, unknown>[]> {
    this.logger.debug('getCarMilageHistory');
    const history = await this.socketService.fetchEntityHistory<
      MilageHistory[][]
    >(7, entity_id);
    const dayMilage = new Map<string, number>();
    if (!history || history.length === 0) {
      return;
    }
    history[0].forEach((history: MilageHistory) => {
      const timestamp = dayjs(history.last_changed)
        .endOf('d')
        .format('YYYY-MM-DD');
      dayMilage.set(timestamp, dayMilage.get(timestamp) || 0);
      const miles = Number(history.state);
      if (miles > dayMilage.get(timestamp)) {
        dayMilage.set(timestamp, miles);
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
          miles: Math.floor(dayMilage.get(date)),
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

  /**
   * All the locks, except the car
   */
  public async setLocks(
    state: HassServices,
    lockList: string[] = null,
  ): Promise<void> {
    const locks =
      lockList ||
      this.entityService
        .entityList()
        .filter((key) => domain(key) === HassDomains.lock)
        .filter((key) => !key.includes('mystique'));
    await Promise.all(
      locks.map(async (entityId) => {
        return this.socketService.call(
          state,
          {
            entity_id: entityId,
          },
          HassDomains.lock,
        );
      }),
    );
  }

  public async toggleTransferPump(): Promise<void> {
    this.logger.debug('toggleTransferPump');
    this.entityService.toggle('switch.transfer_pump');
  }

  // #endregion Public Methods

  // #region Protected Methods

  // @Cron('0 */5 * * * *')
  @Cron('0 0 * * * *')
  protected async Schedule12_12(): Promise<void> {
    this.logger.debug('Schedule12_12');
    const now = dayjs();
    const hour = 5;
    const lightOff = now.startOf('d').add(hour, 'h');
    const lightOn = now.startOf('d').add(hour + 12, 'h');
    if (now.isAfter(lightOff) && now.isBefore(lightOn)) {
      await this.entityService.turnOff('switch.quantum_boards');
      return;
    }
    await this.entityService.turnOn('switch.quantum_boards');
  }

  // @Cron('0 */5 * * * *')
  @Cron('0 0 * * * *')
  protected async Schedule18_6(): Promise<void> {
    this.logger.debug('Schedule18_6');
    const now = dayjs();
    const lightOn = now.startOf('d').add(6, 'h');
    if (now.isBefore(lightOn)) {
      await this.entityService.turnOff('switch.vipar_lights');
      return;
    }
    await this.entityService.turnOn('switch.vipar_lights');
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Cron('0 0 11 * * Wed,Sat')
  private async batteryMonitor() {
    this.logger.debug('batteryMonitor');
    await this.socketService.getAllEntitities();
    await sleep(1000);
    const entities = this.entityService.entityList().filter((entityId) => {
      const [domain, suffix] = split(entityId);
      return domain !== HassDomains.sensor || !suffix.includes('battery');
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
    this.logger.debug(`dayInfo`);
    const cal = this.entityService.SOLAR_CALC;
    const start = dayjs(cal.goldenHourStart).format('hh:mm');
    const end = dayjs(cal.goldenHourEnd).format('hh:mm');
    const message = `🌄 ${dayjs().format('ddd MMM DD')}: ${start} - ${end}`;
    this.homeAssistantService.sendNotification(
      MobileDevice.generic,
      message,
      NotificationGroup.environment,
    );
  }

  @Cron('0 0 22 * * *')
  private async lightOff() {
    this.logger.debug('lightOff');
    await this.entityService.turnOff('switch.back_desk_light');
  }

  @Cron('0 0 7 * * *')
  private async lightOn() {
    this.logger.debug('lightOn');
    await this.entityService.turnOn('switch.back_desk_light');
  }

  // @OnEvent(['*', 'double'])
  // private async autoLock() {
  //   this.logger.info(`autoLock`);
  //   return this.setLocks(HassServices.lock);
  // }
  @OnEvent([CONNECTION_RESET])
  private async onSocketReset() {
    this.logger.debug('onSocketReset');
    await sleep(10000);
    await this.socketService.call(
      MobileDevice.generic,
      {
        message: `Connection reset at ${new Date().toISOString()}`,
        title: `core temporarily lost connection with HomeAssistant`,
        data: {
          push: {
            'thread-id': NotificationGroup.serverStatus,
          },
        },
      },
      HassDomains.notify,
    );
  }

  @OnEvent('switch.bedroom_switch/2')
  private async screenToPersonal() {
    this.logger.debug('screenToPersonal');
    await this.roomService.setRoku(
      LoftRokuInputs.personal,
      this.configService.get('roku.loft.host'),
    );
  }

  @OnEvent('switch.bedroom_switch/1')
  private async screenToWindows() {
    this.logger.debug('screenToWindows');
    await this.roomService.setRoku(
      LoftRokuInputs.windows,
      this.configService.get('roku.loft.host'),
    );
  }

  @OnEvent('switch.bedroom_switch/3')
  private async screenToWork() {
    this.logger.debug('screenToWork');
    await this.roomService.setRoku(
      LoftRokuInputs.work,
      this.configService.get('roku.loft.host'),
    );
  }

  /**
   * Watch binary sensors w/ "door" in the name for changes.
   * Notify on change.
   */
  @OnEvent(`*/update`)
  private sendDoorNotification(event: HassEventDTO) {
    const [domain, suffix] = split(event.data.entity_id);
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
          event.data.new_state.state === 'on' ? 'closed' : 'open'
        }`,
        NotificationGroup.door,
      );
      this.sendDoorNotificationTimeout[event.data.entity_id] = null;
    }, 250);
  }

  @OnEvent('loft/off')
  @OnEvent('switch.bedroom_switch/4')
  private async screenOff() {
    this.logger.debug('screenOff');
    await this.roomService.setRoku(
      LoftRokuInputs.off,
      this.configService.get('roku.loft.host'),
    );
  }

  // #endregion Private Methods
}
