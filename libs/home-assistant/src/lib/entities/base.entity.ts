import dayjs = require('dayjs');
import { EventEmitter } from 'events';
import { Dictionary } from 'lodash';
import { HassServices } from '../../enums/hass-services.enum';
import { SocketService } from '../../home-assistant/socket/socket.service';
import logger from '../../log';
import { hassState } from '../../types/hass-states';
import { iEntity } from '../i-entity.interface';
const { log, warn, error, debug, develop } = logger('BaseEntity');

type f = () => void;
export class BaseEntity extends EventEmitter implements iEntity {
  private nextChangeCbs = [];

  public static DISABLE_INTERACTIONS = false;

  public attributes: Dictionary<unknown> = {};
  public domain;
  public friendlyName = '';
  public lastChanged = dayjs();
  public lastUpdated = dayjs();
  public state = null;

  constructor(public entityId: string, protected socketService: SocketService) {
    super();
    this.domain = entityId.split('.')[0];
  }

  public async call(service: HassServices, args?: Dictionary<unknown>) {
    args = args || {};
    return this.socketService.call(this.domain, service, args) as Promise<void>;
  }

  public async getWarnings() {
    return [];
  }

  public onNextChange(): Promise<void> {
    const p: Promise<void> = new Promise(done => {
      done();
    });
    this.nextChangeCbs.push(p);
    return p;
  }

  public async setState(newState: hassState) {
    if (!this.hasChanged(newState)) {
      return;
    }
    this.lastUpdated = dayjs(newState.last_updated);
    this.lastChanged = dayjs(newState.last_changed);
    this.friendlyName = newState.attributes.friendly_name;
    this.state = newState.state;
    this.attributes = newState.attributes;
    this.onUpdate();
  }

  public async turnOff() {
    // develop(`${this.entityId} turnOff`);
  }

  public async turnOn() {
    // develop(`${this.entityId} turnOn`);
  }

  protected hasChanged(newState: hassState) {
    return !!newState || true;
  }

  protected onUpdate() {
    while (this.nextChangeCbs.length !== 0) {
      const cb = this.nextChangeCbs.pop();
      cb();
    }
    this.emit(`update`);
  }
}
