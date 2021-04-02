import {
  EventDTO,
  HassDomains,
  HassEvents,
  HassStateDTO,
} from '@automagical/contracts';
import { Logger } from '@automagical/logger';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import { NotificationGroup } from '../../typings/notifiction-group.enum';
import { LockEntity } from '../entities/lock.entity';
import { RemoteEntity } from '../entities/remote.entity';
import { EntityService } from './entity.service';
import { RoomService } from './room.service';
import { SocketService } from './socket.service';

@Injectable()
export class HomeAssistantService extends EventEmitter {
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

  /**
   * event handler for when all entities update
   */
  public allEntityUpdate(allEntities: HassStateDTO[]): void {
    allEntities
      // Sort is mostly to clean up logs
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

  public async onModuleInit(): Promise<void> {
    this.socketService.on('onEvent', (args) => this.onEvent(args));
    this.socketService.on('allEntityUpdate', (args) =>
      this.allEntityUpdate(args),
    );
  }

  /**
   * Emit a notification.
   *
   * Can be set up to send push notifications to phones into notification groups
   */
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

  /**
   * Load locks, then set their state
   */
  public async setLocks(
    state: boolean,
    lockList: string[] = null,
  ): Promise<void> {
    const locks =
      lockList ||
      this.entityService
        .listEntities()
        .filter((key) => key.split('.')[0] === 'lock');
    await Promise.all(
      locks.map(async (entityId) => {
        const lock = await this.entityService.byId<LockEntity>(entityId);
        if (state) {
          return lock.lock();
        }
        return lock.unlock();
      }),
    );
  }

  // #endregion Public Methods

  // #region Private Methods

  /**
   * ! This probably will get refactored in the future
   *
   * Event callback for socket events.
   *
   * ## state_changed
   * Something changed about an entity. Create (if not exists) entity, then set it's state
   *
   * ## hue_event
   * Watch for button press events from the hue remote integration.
   */
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
