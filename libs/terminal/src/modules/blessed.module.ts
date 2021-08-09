import { SCREEN_TITLE } from '@automagical/contracts/config';
import { LIB_TERMINAL } from '@automagical/contracts/constants';
import { BLESSED_SCREEN, BLESSED_THEME } from '@automagical/contracts/terminal';
import { AutoConfigService, LibraryModule } from '@automagical/utilities';
import { DynamicModule, Provider } from '@nestjs/common';
import { screen as Screen } from 'blessed';

import { RefreshAfter } from '../decorators';

@LibraryModule({
  exports: [BlessedModule],
  library: LIB_TERMINAL,
  providers: [BlessedModule],
})
export class BlessedModule {
  // #region Public Static Methods

  public static forRoot(BLESSED_COLORS: unknown): DynamicModule {
    const symbols = [
      {
        inject: [AutoConfigService],
        provide: BLESSED_SCREEN,
        useFactory(config: AutoConfigService) {
          const out = Screen({
            autoPadding: true,
            smartCSR: true,
            title: config.get(SCREEN_TITLE),
          });
          // eventEmitter.on
          RefreshAfter.setEmitter(() => {
            out.render();
          });
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
