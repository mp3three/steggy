// prod is a special word
/* eslint-disable unicorn/prevent-abbreviations */
import { ApplicationConfig } from '../typings/config';

export const environment: ApplicationConfig = {
  MQTT_HOST: process.env.MQTT_HOST,
  MQTT_PORT: Number(process.env.MQTT_PORT),
};
export const ASSETS_PATH = 'assets';
