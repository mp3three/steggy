import * as dayjs from 'dayjs';
import { EventEmitter } from 'events';
import { Dictionary } from 'lodash';
import { SocketService } from '..';
import { HassServices, iEntity } from '../../typings';
import { HassStateDTO } from '../dto';

export class BaseEntity extends EventEmitter implements iEntity {
  // #region Static Properties

  public static DISABLE_INTERACTIONS = false;

  // #endregion Static Properties

  // #region Object Properties

  public attributes: Dictionary<unknown> = {};
  public domain;
  public friendlyName = '';
  public lastChanged = dayjs();
  public lastUpdated = dayjs();
  public state = null;

  private readonly nextChangeCbs = [];

  // #endregion Object Properties

  // #region Constructors

  constructor(
    public readonly entityId: string,
    protected readonly socketService: SocketService,
  ) {
    super();
    this.domain = entityId.split('.')[0];
  }

  // #endregion Constructors

  // #region Public Methods

  public async call(service: HassServices, args?: Dictionary<unknown>) {
    args = args || {};
    return this.socketService.call(this.domain, service, args) as Promise<void>;
  }

  public async getWarnings() {
    return [];
  }

  public onNextChange(): Promise<void> {
    const p: Promise<void> = new Promise((done) => done());
    this.nextChangeCbs.push(p);
    return p;
  }

  public async setState(newState: HassStateDTO) {
    if (!this.hasChanged(newState)) {
      return;
    }
    this.lastUpdated = dayjs(newState.last_updated);
    this.lastChanged = dayjs(newState.last_changed);
    this.friendlyName = newState.attributes.friendly_name as string;
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

  // #endregion Public Methods

  // #region Protected Methods

  protected hasChanged(newState: HassStateDTO) {
    return !!newState || true;
  }

  protected onUpdate() {
    while (this.nextChangeCbs.length !== 0) {
      const cb = this.nextChangeCbs.pop();
      cb();
    }
    this.emit(`update`);
  }

  // #endregion Protected Methods
}
