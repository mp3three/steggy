import { BaseEntity } from './base.entity';
import logger from '../../log';
import dayjs = require('dayjs');

const { log, debug, error, warn } = logger('SocketSerRemoteEntityvice');

export class RemoteEntity extends BaseEntity {
  // constructor(entityId: string, socketService: SocketService) {
  //   super(entityId, socketService);
  // }
  public hueEvent(event: number) {
    // These will probably be missed (because of the hue polling)
    const map = {
      1000: '1_click',
      2000: '2_click',
      3000: '3_click',
      4000: '4_click',
      1001: '1_hold',
      2001: '2_hold',
      3001: '3_hold',
      4001: '4_hold',
      // These will be detected always
      1002: '1_click_up',
      2002: '2_click_up',
      3002: '3_click_up',
      4002: '4_click_up',
      1003: '1_hold_up',
      2003: '2_hold_up',
      3003: '3_hold_up',
      4003: '4_hold_up',
    };
    const buttonEvent = map[event] || null;
    if (!buttonEvent) {
      warn(`Unknown button mapping: ${event}`);
      return;
    }
    const buttonNumber = buttonEvent.charAt(0);
    if (
      this.state === buttonNumber &&
      dayjs()
        .add(5, 's')
        .isBefore(this.lastChanged)
    ) {
      return;
    }
    this.state = buttonNumber;
    this.lastChanged = dayjs();
    this.emit(`hueButtonClick`, {
      event,
      buttonEvent,
      buttonNumber,
    });
  }
}
