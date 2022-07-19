import { Injectable, Scope } from '@nestjs/common';
import { HASSIO_WS_COMMAND, HassStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';

import { HASocketAPIService } from './ha-socket-api.service';

@Injectable({ scope: Scope.TRANSIENT })
export class HACallService {
  constructor(private readonly socket: HASocketAPIService) {}

  public domain: string;

  /**
   * Convenience wrapper around sendMsg
   *
   * Does not wait for a response, meant for issuing commands
   */

  public async call<T extends unknown = HassStateDTO>(
    service: string,
    service_data: Record<string, unknown> = {},
    domain: string = this.domain,
    waitForChange = false,
  ): Promise<T> {
    // Filter out superfluous calls here
    // Simplify logic in higher level classes
    if (
      Array.isArray(service_data.entity_id) &&
      is.empty(service_data.entity_id)
    ) {
      return;
    }
    // Here for sanity checking, but too noisy to leave on
    // this.logger.debug({
    //   domain,
    //   service,
    //   service_data,
    //   type: HASSIO_WS_COMMAND.call_service,
    // });
    return await this.socket.sendMessage<T>(
      {
        domain,
        service,
        service_data,
        type: HASSIO_WS_COMMAND.call_service,
      },
      waitForChange,
    );
  }

  public async dismissNotification(notification_id: string): Promise<void> {
    return await this.call(
      'dismiss',
      { notification_id },
      'persistentNotification',
    );
  }

  /**
   * Ask Home Assistant to send a MQTT message
   */
  public async sendMqtt<T = unknown>(
    topic: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    return await this.socket.sendMessage<T>({
      domain: 'mqtt',
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
      'notify',
    );
  }

  public async updateEntity(entityId: string | string[]): Promise<string> {
    return await this.socket.sendMessage({
      domain: 'homeassistant',
      service: 'update_entity',
      service_data: {
        entity_id: entityId,
      },
      type: HASSIO_WS_COMMAND.call_service,
    });
  }
}
