import { MQTT_CLIENT_INSTANCE } from '@automagical/utilities';
import { Inject } from '@nestjs/common';

export function InjectMQTT(): ReturnType<typeof Inject> {
  return Inject(MQTT_CLIENT_INSTANCE);
}
