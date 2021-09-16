import { MqttSubscribeOptions } from '@automagical/utilities';
import { SetMetadata } from '@nestjs/common';

export function OnMQTT(
  topic: string | string[],
  options: MqttSubscribeOptions = {},
): MethodDecorator {
  return function (target, key, descriptor) {
    target[key][MQTT_SUBSCRIBE_OPTIONS] = {
      topic: topic,
      ...options,
    };
    SetMetadata(MQTT_SUBSCRIBE_OPTIONS, {
      topic: topic,
      ...options,
    })(target, key, descriptor);
  };
}
export const MQTT_SUBSCRIBE_OPTIONS = Symbol('MQTT_SUBSCRIBE_OPTIONS');
