import { IsEmpty } from '@ccontour/utilities';
import { Injectable, Scope } from '@nestjs/common';

import { HASS_DOMAINS, HASSIO_WS_COMMAND, HassStateDTO } from '../contracts';
import { HASocketAPIService } from './ha-socket-api.service';

@Injectable({ scope: Scope.TRANSIENT })
export class HACallService {
  constructor(private readonly socketService: HASocketAPIService) {}
  public domain: HASS_DOMAINS;

  /**
   * Convenience wrapper around sendMsg
   *
   * Does not wait for a response, meant for issuing commands
   */

  public async call<T extends unknown = HassStateDTO>(
    service: string,
    service_data: Record<string, unknown> = {},
    domain?: HASS_DOMAINS,
  ): Promise<T> {
    // Filter out superfluous calls here
    // Simplify logic in higher level classes
    if (
      Array.isArray(service_data.entity_id) &&
      IsEmpty(service_data.entity_id)
    ) {
      return;
    }
    return await this.socketService.sendMsg<T>(
      {
        domain: domain ?? this.domain,
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

  public async sendMqtt<T = unknown>(
    topic: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    return await this.socketService.sendMsg<T>({
      domain: HASS_DOMAINS.mqtt,
      service: 'publish',
      service_data: {
        topic,
        ...payload,
      },
      type: HASSIO_WS_COMMAND.call_service,
    });
  }

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
      HASS_DOMAINS.notify,
    );
  }

  public async updateEntity(
    entityId: string | string[],
  ): Promise<HASS_DOMAINS> {
    return await this.socketService.sendMsg({
      domain: HASS_DOMAINS.homeassistant,
      service: 'update_entity',
      service_data: {
        entity_id: entityId,
      },
      type: HASSIO_WS_COMMAND.call_service,
    });
  }
}
