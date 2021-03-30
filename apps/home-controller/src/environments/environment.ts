import { ApplicationConfig } from '../typings/config';
console.log(process.env);
export const environment: ApplicationConfig = {
  MQTT_HOST: process.env.MQTT_HOST,
  MQTT_PORT: Number(process.env.MQTT_PORT),
};
