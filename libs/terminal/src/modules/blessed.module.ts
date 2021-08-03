import { SCREEN_TITLE } from '@automagical/contracts/config';
import { BLESSED_SCREEN, BLESSED_THEME } from '@automagical/contracts/terminal';
import { AutoConfigService } from '@automagical/utilities';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { screen as Screen } from 'blessed';

import { GridLayout } from '../blessed';

@Global()
@Module({
  exports: [BlessedModule],
  providers: [BlessedModule],
})
export class BlessedModule {
  // #region Public Static Methods

  public static forRoot(BLESSED_COLORS: unknown): DynamicModule {
    const symbols = [
      // GridLayout,
      {
        inject: [AutoConfigService],
        provide: BLESSED_SCREEN,
        useFactory(config: AutoConfigService) {
          const out = Screen({
            autoPadding: true,
            smartCSR: true,
            title: config.get(SCREEN_TITLE),
          });
          out.render();
          return out;
        },
      },
      {
        provide: BLESSED_THEME,
        useValue: BLESSED_COLORS,
      },
    ] as Provider[];
    return {
      exports: symbols,
      global: true,
      module: BlessedModule,
      providers: symbols,
    };
  }

  // #endregion Public Static Methods
}
