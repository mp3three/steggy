import { LIB_UTILS } from '@automagical/contracts/constants';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import { LoggableModule } from '../../decorators';
import {
  createS3Connection,
  getS3ConnectionToken,
  getS3OptionsToken,
  S3ModuleAsyncOptions,
  S3ModuleOptions,
  S3ModuleOptionsFactory,
} from '../../includes';

@Global()
@Module({})
@LoggableModule(LIB_UTILS)
export class S3Module {
  // #region Public Static Methods

  public static forRoot(
    options: S3ModuleOptions,
    connection?: string,
  ): DynamicModule {
    const s3OptionsProvider: Provider = {
      provide: getS3OptionsToken(connection),
      useValue: options,
    };

    const s3ConnectionProvider: Provider = {
      provide: getS3ConnectionToken(connection),
      useValue: createS3Connection(options),
    };

    return {
      exports: [s3OptionsProvider, s3ConnectionProvider],
      module: S3Module,
      providers: [s3OptionsProvider, s3ConnectionProvider],
    };
  }

  public static forRootAsync(
    options: S3ModuleAsyncOptions,
    connection?: string,
  ): DynamicModule {
    const s3ConnectionProvider: Provider = {
      inject: [getS3OptionsToken(connection)],
      provide: getS3ConnectionToken(connection),
      useFactory(options: S3ModuleOptions) {
        return createS3Connection(options);
      },
    };

    return {
      exports: [s3ConnectionProvider],
      imports: options.imports,
      module: S3Module,
      providers: [
        ...this.createAsyncProviders(options, connection),
        s3ConnectionProvider,
      ],
    };
  }

  // #endregion Public Static Methods

  // #region Private Static Methods

  private static createAsyncOptionsProvider(
    options: S3ModuleAsyncOptions,
    connection?: string,
  ): Provider {
    if (!(options.useExisting || options.useFactory || options.useClass)) {
      throw new Error(
        'Invalid configuration. Must provide useFactory, useClass or useExisting',
      );
    }

    if (options.useFactory) {
      return {
        inject: options.inject || [],
        provide: getS3OptionsToken(connection),
        useFactory: options.useFactory,
      };
    }

    return {
      inject: [options.useClass || options.useExisting],
      provide: getS3OptionsToken(connection),
      async useFactory(
        optionsFactory: S3ModuleOptionsFactory,
      ): Promise<S3ModuleOptions> {
        return await optionsFactory.createS3ModuleOptions();
      },
    };
  }

  private static createAsyncProviders(
    options: S3ModuleAsyncOptions,
    connection?: string,
  ): Provider[] {
    if (!(options.useExisting || options.useFactory || options.useClass)) {
      throw new Error(
        'Invalid configuration. Must provide useFactory, useClass or useExisting',
      );
    }

    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options, connection)];
    }

    return [
      this.createAsyncOptionsProvider(options, connection),
      { provide: options.useClass, useClass: options.useClass },
    ];
  }

  // #endregion Private Static Methods
}
