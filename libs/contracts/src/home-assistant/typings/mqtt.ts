export type MqttResponse = {
  topic: string;
  payload: string | Record<string, unknown> | Buffer;
};
