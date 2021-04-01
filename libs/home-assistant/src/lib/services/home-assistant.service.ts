import { Logger } from '@automagical/logger';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { readFileSync } from 'fs';
import { EventEmitter } from 'events';
import { join } from 'path';
import { HassDomains, HassEvents } from '../typings';
import { MqttResponse } from '../typings/mqtt';
import { NotificationGroup } from '../typings/notifiction-group.enum';
import { EventDTO, HassStateDTO } from './dto';
import { LockEntity } from './entities/lock.entity';
import { RemoteEntity } from './entities/remote.entity';
import { EntityService } from './entity.service';
import { RoomService } from './room.service';
import { SocketService } from './socket.service';
import { ConfigService } from '@nestjs/config';

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
export class HomeAssistantService extends EventEmitter {
  // #region Static Properties

  private static ESPMapping: Record<string, string> = null;
  private static backDoorLock: LockEntity;
  private static frontDoorLock: LockEntity;

  // #endregion Static Properties

  // #region Object Properties

  private readonly logger = Logger(HomeAssistantService);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    public readonly socketService: SocketService,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
    public readonly roomService: RoomService,
    public readonly configService: ConfigService,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  public async allEntityUpdate(allEntities: HassStateDTO[]): Promise<void> {
    allEntities
      .sort((a, b) => {
        if (a.entity_id > b.entity_id) {
          return 1;
        }
        return -1;
      })
      .forEach(async (entity) => {
        const e = await this.entityService.create(entity.entity_id);
        if (e) {
          e.setState(entity);
        }
      });
  }

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

  public async onModuleInit(): Promise<void> {
    this.socketService.on('onEvent', (args) => this.onEvent(args));
    this.socketService.on('allEntityUpdate', (args) =>
      this.allEntityUpdate(args),
    );
    HomeAssistantService.frontDoorLock = await this.entityService.byId(
      'lock.front_door',
    );
    HomeAssistantService.backDoorLock = await this.entityService.byId(
      'lock.front_door',
    );
    if (HomeAssistantService.ESPMapping === null) {
      const configPath = join(
        this.configService.get('application.CONFIG_PATH'),
        'esp-mapping.json',
      );
      HomeAssistantService.ESPMapping = JSON.parse(
        readFileSync(configPath, 'utf-8'),
      );
    }
  }

  public async sendNotification(
    device: string,
    title: string,
    group: NotificationGroup,
    message = '',
  ): Promise<void> {
    return this.socketService.call(HassDomains.notify, device, {
      message,
      title,
      data: {
        push: {
          'thread-id': group,
        },
      },
    });
  }

  public async setLocks(state: boolean): Promise<void> {
    if (state) {
      await HomeAssistantService.frontDoorLock.lock();
      return HomeAssistantService.backDoorLock.lock();
    }
    await HomeAssistantService.frontDoorLock.unlock();
    return HomeAssistantService.backDoorLock.unlock();
  }

  // #endregion Public Methods

  // #region Private Methods

  private async onEvent(event: EventDTO) {
    let state, entity, remote;
    switch (event.event_type) {
      case HassEvents.state_changed:
        state = event.data.new_state;
        entity = await this.entityService.create(event.data.entity_id);
        if (!entity) {
          return;
        }
        if (state === null) {
          this.logger.info(`null new state`);
          this.logger.debug(event);
          return;
        }
        entity.setState(event.data.new_state);
        return;
      case HassEvents.hue_event:
        remote = await this.entityService.create<RemoteEntity>(
          `remote.${event.data.id}`,
        );
        remote.hueEvent(event.data.event);
        return;
    }
  }

  // #endregion Private Methods
}
