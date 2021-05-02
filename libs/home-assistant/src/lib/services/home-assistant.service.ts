import {
  HA_RAW_EVENT,
  LIB_HOME_ASSISTANT,
} from '@automagical/contracts/constants';
import {
  HassDomains,
  HassEventDTO,
  HassEvents,
} from '@automagical/contracts/home-assistant';
import { InjectLogger } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';
import { SocketService } from './socket.service';

@Injectable()
export class HomeAssistantService {
  // #region Constructors

  constructor(
    private readonly socketService: SocketService,
    @InjectLogger(HomeAssistantService, LIB_HOME_ASSISTANT)
    protected readonly logger: PinoLogger,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async sendNotification<Group extends string = string>(
    device: string,
    title: string,
    group: Group,
    message = '',
  ): Promise<void> {
    return this.socketService.call(
      device,
      {
        message,
        title,
        data: {
          push: {
            'thread-id': group,
          },
        },
      },
      HassDomains.notify,
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

  // #endregion Private Methods
}
