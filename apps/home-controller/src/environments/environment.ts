import { join } from 'path';
import { ApplicationConfig } from '../typings/config';

export const environment: ApplicationConfig = {
  MQTT_HOST: process.env.MQTT_HOST,
  MQTT_PORT: Number(process.env.MQTT_PORT),
  ASSETS_PATH: join(__dirname, '../assets'),
};
