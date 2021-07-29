import { ACTIVE_APPLICATION } from '@automagical/contracts/utilities';
import { DynamicModule, Provider } from '@nestjs/common';

export class SymbolProviderModule {
  // #region Public Static Methods

  public static forRoot(APPLICATION:symbol, GLOBAL_SYMBOLS: Provider[] = []): DynamicModule {
    GLOBAL_SYMBOLS.push({
      provide: ACTIVE_APPLICATION,
      useValue: APPLICATION
    });
    return {
      exports: GLOBAL_SYMBOLS,
      global: true,
      imports: [],
      module: SymbolProviderModule,
      providers: GLOBAL_SYMBOLS,
    };
  }

  // #endregion Public Static Methods
}
