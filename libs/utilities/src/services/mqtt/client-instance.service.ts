import { Inject, Injectable } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';

import { MQTT_HEALTH_CHECK_INTERVAL, MQTT_HOST, MQTT_PORT } from '../../config';
import { ACTIVE_APPLICATION } from '../../contracts/meta/config';
import { MQTT_HEALTH_CHECK } from '../../contracts/mqtt';
import { InjectConfig } from '../../decorators/injectors/inject-config.decorator';

@Injectable()
export class MQTTClientInstanceService {
  constructor(
    @Inject(ACTIVE_APPLICATION) private readonly application: symbol,
    @InjectConfig(MQTT_HOST) private readonly host: string,
    @InjectConfig(MQTT_PORT) private readonly port: number,
    @InjectConfig(MQTT_HEALTH_CHECK_INTERVAL) private readonly interval: number,
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
    setInterval(() => {
      if (!this.client.connected) {
        return;
      }
      this.client.publish(MQTT_HEALTH_CHECK, this.application.description);
    }, this.interval);
    return this.client;
  }
}
