import { HA_RAW_EVENT } from '@automagical/contracts/constants';
import {
  HassDomains,
  HassEventDTO,
  HassEvents,
  HassServices,
} from '@automagical/contracts/home-assistant';
import { Logger } from '@automagical/logger';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EntityService } from './entity.service';
import { SocketService } from './socket.service';

@Injectable()
export class HomeAssistantService {
  // #region Object Properties

  private readonly logger = Logger(HomeAssistantService);

  private lastEvent = '';

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly socketService: SocketService,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Emit a notification.
   *
   * Can be set up to send push notifications to phones into notification groups
   *
   * Type param is intended as allowing usage with an enum
   */
  public async sendNotification<Group extends string = string>(
    device: string,
    title: string,
    group: Group,
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
    state: HassServices,
    lockList: string[] = null,
  ): Promise<void> {
    const locks =
      lockList ||
      this.entityService
        .listEntities()
        .filter((key) => key.split('.')[0] === 'lock');
    await Promise.all(
      locks.map(async (entityId) => {
        return this.socketService.call(HassDomains.lock, state, {
          entity_id: entityId,
        });
      }),
    );
  }

  // #endregion Public Methods

  // #region Private Methods

  @OnEvent([HA_RAW_EVENT])
  private async onHueEvent(event: HassEventDTO) {
    if (event.event_type !== HassEvents.hue_event) {
      return;
    }
    // Hue Remote button map
    // 1000: '1_click'
    // 1001: '1_hold'
    // 1003: '1_hold_up'
    // 1002: '1_click_up'
    // 2000: '2_click'
    // 2001: '2_hold'
    // 2003: '2_hold_up'
    // 2002: '2_click_up'
    // 3000: '3_click'
    // 3001: '3_hold'
    // 3002: '3_click_up'
    // 3003: '3_hold_up'
    // 4000: '4_click'
    // 4001: '4_hold'
    // 4002: '4_click_up'
    // 4003: '4_hold_up'
    // The reality of this device is the performance is too bad for most of these to be relevant
    // It seems to work better with 1st party stuff

    // The Lutron Pico devices are better in every way
    switch (Math.floor(Number(event.data.event) / 1000)) {
      case 1:
        return this.eventEmitter.emit(`switch.${event.data.id}/1`);
      case 2:
        return this.eventEmitter.emit(`switch.${event.data.id}/2`);
      case 3:
        return this.eventEmitter.emit(`switch.${event.data.id}/3`);
      case 4:
        return this.eventEmitter.emit(`switch.${event.data.id}/4`);
    }
  }

  @OnEvent([HA_RAW_EVENT])
  private async onPicoEvent(event: HassEventDTO) {
    type t = { state: string };
    let domain, suffix, evt, prefix, state: t;
    switch (event.event_type) {
      case HassEvents.state_changed:
        [domain, suffix] = event.data.entity_id.split('.');
        if ((domain as HassDomains) !== HassDomains.sensor) {
          return;
        }
        prefix = event.data.entity_id;
        if (suffix.includes('pico')) {
          this.eventEmitter.emit(
            `${prefix}/pico`,
            event.data.new_state,
            prefix,
          );
        }
        evt = `${prefix}/single`;
        if (evt === this.lastEvent) {
          evt = `${prefix}/double`;
        } else {
          if (`${prefix}/double` === this.lastEvent) {
            return;
          }
        }
        this.lastEvent = evt;
        setTimeout(() => (this.lastEvent = ''), 1000 * 5);
        state = event.data.new_state as t;
        return this.eventEmitter.emit(evt, state.state, prefix);
    }
  }

  // #endregion Private Methods
}
