import { SCREEN_TITLE } from '@automagical/contracts/config';
import {
  BLESSED_SCREEN,
  BLESSED_THEME,
  SCREEN_REFESH,
} from '@automagical/contracts/terminal';
import { AutoConfigService } from '@automagical/utilities';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { screen as Screen } from 'blessed';

import { RefreshAfter } from '../decorators';

@Global()
@Module({
  exports: [BlessedModule],
  providers: [BlessedModule],
})
export class BlessedModule {
  // #region Public Static Methods

  public static forRoot(BLESSED_COLORS: unknown): DynamicModule {
    const symbols = [
      {
        inject: [AutoConfigService, EventEmitter2],
        provide: BLESSED_SCREEN,
        useFactory(config: AutoConfigService, eventEmitter: EventEmitter2) {
          const out = Screen({
            autoPadding: true,
            smartCSR: true,
            title: config.get(SCREEN_TITLE),
          });
          eventEmitter.on(SCREEN_REFESH, () => out.render());
          RefreshAfter.setEmitter(eventEmitter);
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
