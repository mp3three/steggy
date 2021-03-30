import { FormioSDKConfig } from './formio-sdk';
import { HomeAssistantConfig } from './home-assistant';
import { LicensesConfig } from './licenses';
import { LoggerConfig } from './logger';

export class AutomagicalConfig {
  ['formio-sdk']?: FormioSDKConfig;
  ['home-assistant']?: HomeAssistantConfig;
  logger?: LoggerConfig;
  licenses?: LicensesConfig;
}

export * from './formio-sdk';
export * from './home-assistant';
export * from './licenses';
export * from './logger';
