import { MQTT_CLIENT_INSTANCE } from '@automagical/contracts/utilities';
import { Inject, Injectable } from '@nestjs/common';
import {
  Client,
  IClientPublishOptions,
  IClientSubscribeOptions,
  ISubscriptionGrant,
  Packet,
} from 'mqtt';

/* eslint-disable radar/no-identical-functions */

@Injectable()
export class MqttService {
  // #region Constructors

  constructor(@Inject(MQTT_CLIENT_INSTANCE) private readonly client: Client) {}

  // #endregion Constructors

  // #region Public Methods

  public publish(
    topic: string,
    message: string | Buffer | Record<string, unknown>,
    options?: IClientPublishOptions,
  ): Promise<Packet> {
    return new Promise<Packet>((resolve, reject) => {
      if (typeof message === 'object') {
        message = JSON.stringify(message);
      }
      this.client.publish(topic, message, options, (error, packet) => {
        if (error) {
          reject(error);
        } else {
          resolve(packet);
        }
      });
    });
  }

  public subscribe(
    topic: string | string[],
    options?: IClientSubscribeOptions,
  ): Promise<ISubscriptionGrant[]> {
    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, options, (error, granted) => {
        if (error) {
          reject(error);
        } else {
          resolve(granted);
        }
      });
    });
  }

  public unsubscribe(
    topic: string,
    options?: Record<string, unknown>,
  ): Promise<Packet> {
    return new Promise<Packet>((resolve, reject) => {
      this.client.unsubscribe(topic, options, (error, packet) => {
        if (error) {
          reject(error);
        } else {
          resolve(packet);
        }
      });
    });
  }

  // #endregion Public Methods
}
