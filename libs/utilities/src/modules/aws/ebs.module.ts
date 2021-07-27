import { LIB_UTILS } from '@automagical/contracts/constants';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import { LoggableModule } from '../../decorators';
import {
  createEBSConnection,
  EBSModuleAsyncOptions,
  EBSModuleOptions,
  EBSModuleOptionsFactory,
  getEBSConnectionToken,
  getEBSOptionsToken,
} from '../../includes';

@Global()
@Module({})
@LoggableModule(LIB_UTILS)
export class EBSModule {
  // #region Public Static Methods

  /* createAsyncOptionsProvider */
  public static createAsyncOptionsProvider(
    options: EBSModuleAsyncOptions,
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
        provide: getEBSOptionsToken(connection),
        useFactory: options.useFactory,
      };
    }

    return {
      inject: [options.useClass || options.useExisting],
      provide: getEBSOptionsToken(connection),
      async useFactory(
        optionsFactory: EBSModuleOptionsFactory,
      ): Promise<EBSModuleOptions> {
        return await optionsFactory.createEBSModuleOptions();
      },
    };
  }

  /* createAsyncProviders */
  public static createAsyncProviders(
    options: EBSModuleAsyncOptions,
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

  /* forRoot */
  public static forRoot(
    options: EBSModuleOptions,
    connection?: string,
  ): DynamicModule {
    const EBSOptionsProvider: Provider = {
      provide: getEBSOptionsToken(connection),
      useValue: options,
    };

    const EBSConnectionProvider: Provider = {
      provide: getEBSConnectionToken(connection),
      useValue: createEBSConnection(options),
    };

    return {
      exports: [EBSOptionsProvider, EBSConnectionProvider],
      module: EBSModule,
      providers: [EBSOptionsProvider, EBSConnectionProvider],
    };
  }

  /* forRootAsync */
  public static forRootAsync(
    options: EBSModuleAsyncOptions,
    connection?: string,
  ): DynamicModule {
    const EBSConnectionProvider: Provider = {
      inject: [getEBSOptionsToken(connection)],
      provide: getEBSConnectionToken(connection),
      useFactory(options: EBSModuleOptions) {
        return createEBSConnection(options);
      },
    };

    return {
      exports: [EBSConnectionProvider],
      imports: options.imports,
      module: EBSModule,
      providers: [
        ...this.createAsyncProviders(options, connection),
        EBSConnectionProvider,
      ],
    };
  }

  // #endregion Public Static Methods
}
