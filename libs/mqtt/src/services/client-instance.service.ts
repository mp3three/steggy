import { Inject, Injectable } from '@nestjs/common';
import { ACTIVE_APPLICATION, InjectConfig } from '@text-based/boilerplate';
import { connect, MqttClient } from 'mqtt';

import { MQTT_HOST, MQTT_PORT } from '../config';

@Injectable()
export class MQTTClientInstanceService {
  constructor(
    @Inject(ACTIVE_APPLICATION) private readonly application: symbol,
    @InjectConfig(MQTT_HOST) private readonly host: string,
    @InjectConfig(MQTT_PORT) private readonly port: number,
  ) {}
  private client: MqttClient;

  public createConnection(): MqttClient {
    if (this.client) {
      return this.client;
    }
    this.client = connect({
      host: this.host,
      port: this.port,
    });
    return this.client;
  }
}
