import {
  MQTT_SUBSCRIBE_OPTIONS,
  MQTT_SUBSCRIBER_PARAMS,
  MqttMessageTransformer,
  MqttSubscribeOptions,
  MqttSubscriberParameter,
} from '@automagical/contracts/utilities';
import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

/* eslint-disable security/detect-object-injection */

export function Subscribe(
  topicOrOptions: string | string[] | MqttSubscribeOptions,
): CustomDecorator {
  return typeof topicOrOptions === 'string' || Array.isArray(topicOrOptions)
    ? SetMetadata(MQTT_SUBSCRIBE_OPTIONS, {
        topic: topicOrOptions,
      })
    : SetMetadata(MQTT_SUBSCRIBE_OPTIONS, topicOrOptions);
}

function SetParameter(parameter: Partial<MqttSubscriberParameter>) {
  return (
    target: ClassConstructor<unknown>,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    const parameters =
      Reflect.getMetadata(MQTT_SUBSCRIBER_PARAMS, target[propertyKey]) || [];
    parameters.push({
      index: parameterIndex,
      ...parameter,
    });
    Reflect.defineMetadata(
      MQTT_SUBSCRIBER_PARAMS,
      parameters,
      target[propertyKey],
    );
  };
}

/**
 * Take the topic in parameters.
 * @constructor
 */
export function Topic(): ReturnType<typeof SetParameter> {
  return SetParameter({
    type: 'topic',
  });
}

/**
 * Take the raw packet in parameters.
 * @constructor
 */
export function Packet(): ReturnType<typeof SetParameter> {
  return SetParameter({
    type: 'packet',
  });
}

/**
 * Take the payload in parameters.
 * @param transform
 * @constructor
 */
export function Payload(
  transform?: 'json' | 'text' | MqttMessageTransformer,
): ReturnType<typeof SetParameter> {
  return SetParameter({
    transform,
    type: 'payload',
  });
}

/**
 * Take an array as parameter of a topic with wildcard.
 * Such like topic: foo/+/bar/+, you will get an array like:
 * ['first', 'second']
 */
export function MQTTParameters(): ReturnType<typeof SetParameter> {
  return SetParameter({
    type: 'params',
  });
}
