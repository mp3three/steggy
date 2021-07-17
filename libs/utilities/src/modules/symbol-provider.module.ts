import { CacheModule, DynamicModule, Provider } from '@nestjs/common';

export class SymbolProviderModule {
  // #region Public Static Methods

  public static forRoot(CRUD_WIRING: Provider[]): DynamicModule {
    return {
      exports: CRUD_WIRING,
      global: true,
      imports: [CacheModule.register()],
      module: SymbolProviderModule,
      providers: CRUD_WIRING,
    };
  }

  // #endregion Public Static Methods
}
