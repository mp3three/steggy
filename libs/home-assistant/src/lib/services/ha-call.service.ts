import { LIB_HOME_ASSISTANT } from '@automagical/contracts/constants';
import {
  HassDomains,
  HASSIO_WS_COMMAND,
  HassServices,
} from '@automagical/contracts/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { PinoLogger } from 'nestjs-pino';

import { HASocketAPIService } from './ha-socket-api.service';

export class HACallService {
  // #region Constructors

  constructor(
    @InjectLogger(HACallService, LIB_HOME_ASSISTANT)
    private readonly logger: PinoLogger,
    private readonly socketService: HASocketAPIService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Convenience wrapper around sendMsg
   *
   * Does not wait for a response, meant for issuing commands
   */
  @Trace()
  public async call<T extends void = void>(
    service: HassServices | string,
    service_data: Record<string, unknown> = {},
    domain: HassDomains = HassDomains.homeassistant,
  ): Promise<T> {
    return await this.socketService.sendMsg<T>(
      {
        domain,
        service,
        service_data,
        type: HASSIO_WS_COMMAND.call_service,
      },
      false,
    );
  }

  /**
   * Ask Home Assistant to send a MQTT message
   */
  @Trace()
  public async sendMqtt<T = unknown>(
    topic: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    return await this.socketService.sendMsg<T>({
      domain: HassDomains.mqtt,
      service: HassServices.publish,
      service_data: {
        topic,
        ...payload,
      },
      type: HASSIO_WS_COMMAND.call_service,
    });
  }

  @Trace()
  public async sendNotification<Group extends string = string>(
    device: string,
    title: string,
    group: Group,
    message = '',
  ): Promise<void> {
    return this.call(
      device,
      {
        data: {
          push: {
            'thread-id': group,
          },
        },
        message,
        title,
      },
      HassDomains.notify,
    );
  }

  @Trace()
  public async updateEntity(entityId: string): Promise<HassDomains> {
    return await this.socketService.sendMsg({
      domain: HassDomains.homeassistant,
      service: HassServices.update_entity,
      service_data: {
        entity_id: entityId,
      },
      type: HASSIO_WS_COMMAND.call_service,
    });
  }

  // #endregion Public Methods
}
