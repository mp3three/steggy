import { Inject, Injectable } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';

import { MQTT_HOST, MQTT_PORT } from '../../config';
import { ACTIVE_APPLICATION } from '../../contracts/meta/config';
import { MQTT_HEALTH_CHECK } from '../../contracts/mqtt';
import { InjectConfig } from '../../decorators/injectors/inject-config.decorator';

@Injectable()
export class MQTTClientInstanceService {
  private client: MqttClient;
  constructor(
    @Inject(ACTIVE_APPLICATION) private readonly application: symbol,
    @InjectConfig(MQTT_HOST) private readonly host: string,
    @InjectConfig(MQTT_PORT) private readonly port: number,
  ) {}

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
    }, 1000);
    return this.client;
  }
}
