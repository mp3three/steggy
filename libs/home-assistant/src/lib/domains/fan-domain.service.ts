import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import { InjectLogger, Trace } from '@automagical/utilities';
import { PinoLogger } from 'nestjs-pino';

import { HACallService } from '../services';

export class FanDomainService {
  // #region Constructors

  constructor(
    @InjectLogger(FanDomainService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly callService: HACallService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async decreaseSpeed(entityId?: string): Promise<void> {
    return await this.callService.call('descrease_speed', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async fanDirection(entityId?: string): Promise<void> {
    return await this.callService.call('set_direction', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async increaseSpeed(entityId?: string): Promise<void> {
    return await this.callService.call('increase_speed', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async oscillate(entityId?: string): Promise<void> {
    return await this.callService.call('oscillate', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async setPercentage(
    entityId?: string,
    percentage?: number,
  ): Promise<void> {
    return await this.callService.call('set_percentage', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async setPresetMode(entityId?: string): Promise<void> {
    return await this.callService.call('set_preset_mode', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async toggle(entityId?: string): Promise<void> {
    return await this.callService.call('toggle', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOff(entityId?: string): Promise<void> {
    return await this.callService.call('turn_off', {
      entity_id: entityId,
    });
  }

  @Trace()
  public async turnOn(entityId?: string): Promise<void> {
    return await this.callService.call('turn_on', {
      entity_id: entityId,
    });
  }

  // #endregion Public Methods
}
