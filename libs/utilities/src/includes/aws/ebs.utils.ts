import { Abstract, ModuleMetadata, Type } from '@nestjs/common';
import AWS from 'aws-sdk';
import EBS from 'aws-sdk/clients/ebs';

export const EBS_MODULE_CONNECTION = 'default';
export const EBS_MODULE_CONNECTION_TOKEN = 'S3ModuleConnectionToken';
export const EBS_MODULE_OPTIONS_TOKEN = 'S3ModuleOptionsToken';

export function getEBSOptionsToken(connection: string): string {
  return `${connection || EBS_MODULE_CONNECTION}_${EBS_MODULE_OPTIONS_TOKEN}`;
}

export function getEBSConnectionToken(connection: string): string {
  return `${
    connection || EBS_MODULE_CONNECTION
  }_${EBS_MODULE_CONNECTION_TOKEN}`;
}

export function createEBSConnection(options: EBSModuleOptions): EBS {
  const { config } = options;
  config.apiVersion = config.apiVersion || '2006-03-01';
  return new EBS(config);
}

export interface EBSModuleOptions {
  // #region Object Properties

  config: AWS.EBS.ClientConfiguration;

  // #endregion Object Properties
}

export interface EBSModuleOptionsFactory {
  // #region Public Methods

  createEBSModuleOptions(): Promise<EBSModuleOptions> | EBSModuleOptions;

  // #endregion Public Methods
}

export interface EBSModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  // #region Object Properties

  inject?: (string | symbol | Type | Abstract<unknown>)[];
  useClass?: Type<EBSModuleOptionsFactory>;
  useExisting?: Type<EBSModuleOptionsFactory>;
  useFactory?: (
    ...arguments_: unknown[]
  ) => Promise<EBSModuleOptions> | EBSModuleOptions;

  // #endregion Object Properties
}
