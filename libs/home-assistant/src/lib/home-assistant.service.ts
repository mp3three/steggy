import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { EntityStateDTO } from '../dto';
import { HassEvents } from '../typings';
import { Logger } from '@automagical/logger';

@Injectable()
export class HomeAssistantService {
  // #region Object Properties

  private logger = Logger(HomeAssistantService);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    public socketService: SocketService,
    @Inject(forwardRef(() => EntityService))
    private entityService: EntityService,
    public roomService: RoomService,
  ) {
    HomeAssistantService.initComplete = true;
    socketService.on('onEvent', (args) => this.onEvent(args));
    socketService.on('allEntityUpdate', (args) => this.allEntityUpdate(args));
    process.nextTick(async () => {
      HomeAssistantService.frontDoorLock = await entityService.byId(
        'lock.front_door',
      );
      HomeAssistantService.backDoorLock = await entityService.byId(
        'lock.front_door',
      );
    });
    if (HomeAssistantService.ESPMapping === null) {
      const configPath = join(process.env.CONFIG_PATH, 'core/esp-mapping.json');
      HomeAssistantService.ESPMapping = JSON.parse(
        readFileSync(configPath, 'utf-8'),
      );
    }
  }

  // #endregion Constructors

  // #region Public Methods

  public async allEntityUpdate(allEntities: hassState[]) {
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
    log(`configureEsp: ${macAddress}`);
    return {
      topic: `${macAddress}/configure/entity-id`,
      payload: HomeAssistantService.ESPMapping[macAddress],
    };
  }

  public async getMystiqueMilageHistory(entity_id: string) {
    const history = await this.socketService.fetchEntityHistory(7, entity_id);
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

  public async getWarnings() {
    return [...(await this.getAdguardWarning())];
  }

  // public quickSet(setActions: QuickSetArgs) {
  //   develop(setActions);
  //   Object.keys(setActions).forEach(action => {
  //     setActions[action].forEach(async info => {
  //       let entityId: string;
  //       let data = null;
  //       if (typeof info === 'object') {
  //         entityId = info.entity_id as string;
  //         data = info;
  //       } else {
  //         entityId = info;
  //         data = {
  //           entity_id: info,
  //         };
  //       }
  //       const entity = await this.entityService.byId(entityId);
  //       if (entity === null) {
  //         error(`${entityId} is null`);
  //         return;
  //       }
  //       entity.call(action as HassServices, data);
  //     });
  //   });
  // }

  // private async actionable() {
  //   //   {
  //   //     "message": "Would you like to close the garage door?",
  //   //     "title": "Garage Door Left Open",
  //   //     "data": {
  //   //         "actions": [
  //   //             {
  //   //                 "action": "close_door",
  //   //                 "title": "Close Door"
  //   //             },
  //   //             {
  //   //                 "action": "ignore",
  //   //                 "title": "Ignore"
  //   //             }
  //   //         ]
  //   //     }
  //   // }
  //   // https://www.smarthomelab.ca/ios-actionable-notifications-with-home-companion/
  //   // https://companion.home-assistant.io/docs/notifications/actionable-notifications/
  //   // https://www.reddit.com/r/homeassistant/comments/gdoio9/actionable_notificationsfinally_fought_with_it/
  //   return this.connection.call(HassDomains.notify, MobileDevice.generic, {
  //     message: 'TEST message',
  //     title: 'test titile',
  //     data: {
  //       subtitle: 'subtitle',
  //       push: {
  //         'thread-id': NotificationGroup.garageStatus,
  //         category: 'test',
  //       },
  //     },
  //   });
  // }
  public async sendDynamicAttachment(): Promise<never> {
    error('Fill in this function');
    process.exit();
    // https://companion.home-assistant.io/docs/notifications/dynamic-content/
    //   {
    //     "message": "This is camera test!",
    //     "data": {
    //         "push": {
    //             "category": "camera"
    //         },
    //         "entity_id": "camera.xxx"
    //     }
    // }
  }

  public async sendNotification(
    device: MobileDevice,
    title: string,
    group: NotificationGroup,
    message = '',
  ) {
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

  public async setLocks(state: boolean) {
    if (state) {
      await HomeAssistantService.frontDoorLock.lock();
      return HomeAssistantService.backDoorLock.lock();
    }
    await HomeAssistantService.frontDoorLock.unlock();
    return HomeAssistantService.backDoorLock.unlock();
  }

  // #endregion Public Methods

  // #region Private Methods

  private async getAdguardWarning() {
    const adguard = await this.entityService.byId<SwitchEntity>(
      'switch.adguard_protection',
    );
    if (adguard.state === 'on') {
      return [];
    }
    return ['Adguard protection currently disabled'];
  }

  private async onEvent(event: HassEvent) {
    switch (event.event_type) {
      case HassEvents.state_changed:
        const state = event.data.new_state;
        const entity = await this.entityService.create(event.data.entity_id);
        if (!entity) {
          return;
        }
        if (state === null) {
          log(`null new state`);
          log(event);
          return;
        }
        entity.setState(state);
        return;
      case HassEvents.hue_event:
        const remote = await this.entityService.create<RemoteEntity>(
          `remote.${event.data.id}`,
        );
        remote.hueEvent(event.data.event);
        return;
    }
  }

  // #endregion Private Methods
}
