import { FormioSDKConfig } from './formio-sdk';
import { HomeAssistantConfig } from './home-assistant';
import { LicensesConfig } from './licenses';
import { LoggerConfig } from './logger';

export class AutomagicalConfig<
  Application extends Record<never, unknown> = Record<never, unknown>
> {
  ['formio-sdk']?: FormioSDKConfig;
  ['home-assistant']?: HomeAssistantConfig;
  logger?: LoggerConfig;
  licenses?: LicensesConfig;
  application?: Application;
  NODE_ENV?: string;
  LOG_LEVEL?: string;
}

export * from './formio-sdk';
export * from './home-assistant';
export * from './licenses';
export * from './logger';
