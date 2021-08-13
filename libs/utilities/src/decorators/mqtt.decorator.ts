import { MqttSubscribeOptions } from '@automagical/contracts/utilities';
import { SetMetadata } from '@nestjs/common';

export function OnMQTT(
  topicOrOptions: string | string[] | MqttSubscribeOptions,
): MethodDecorator {
  return function (target, key, descriptor) {
    target[key][MQTT_SUBSCRIBE_OPTIONS] = {
      topic: topicOrOptions,
    };
    SetMetadata(MQTT_SUBSCRIBE_OPTIONS, {
      topic: topicOrOptions,
    })(target, key, descriptor);
  };
}
export const MQTT_SUBSCRIBE_OPTIONS = Symbol('MQTT_SUBSCRIBE_OPTIONS');
