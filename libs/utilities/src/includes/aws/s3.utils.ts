import { Abstract, ModuleMetadata, Type } from '@nestjs/common';
import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';

export const S3_MODULE_CONNECTION = 'default';
export const S3_MODULE_CONNECTION_TOKEN = 'S3ModuleConnectionToken';
export const S3_MODULE_OPTIONS_TOKEN = 'S3ModuleOptionsToken';

export function getS3OptionsToken(connection: string): string {
  return `${connection || S3_MODULE_CONNECTION}_${S3_MODULE_OPTIONS_TOKEN}`;
}

export function getS3ConnectionToken(connection: string): string {
  return `${connection || S3_MODULE_CONNECTION}_${S3_MODULE_CONNECTION_TOKEN}`;
}

export function createS3Connection(options: S3ModuleOptions): S3 {
  const { config } = options;
  config.apiVersion = config.apiVersion || '2006-03-01';
  return new S3(config);
}

export interface S3ModuleOptions {
  // #region Object Properties

  config: AWS.S3.ClientConfiguration;

  // #endregion Object Properties
}

export interface S3ModuleOptionsFactory {
  // #region Public Methods

  createS3ModuleOptions(): Promise<S3ModuleOptions> | S3ModuleOptions;

  // #endregion Public Methods
}

export interface S3ModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  // #region Object Properties

  inject?: (string | symbol | Type | Abstract<unknown>)[];
  useClass?: Type<S3ModuleOptionsFactory>;
  useExisting?: Type<S3ModuleOptionsFactory>;
  useFactory?: (
    ...arguments_: unknown[]
  ) => Promise<S3ModuleOptions> | S3ModuleOptions;

  // #endregion Object Properties
}
