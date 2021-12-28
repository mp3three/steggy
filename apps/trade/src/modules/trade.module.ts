import { DiscoveryModule } from '@nestjs/core';
import { AlpacaModule } from '@text-based/alpaca';
import { MainCLIModule } from '@text-based/tty';
import { ApplicationModule, UtilitiesModule } from '@text-based/utilities';

import {
  AlpacaAccountService,
  AlpacaOrderService,
  AlpacaPositionService,
  AssetService,
  TradeService,
} from '../services';

@ApplicationModule({
  application: Symbol('trade'),
  imports: [
    AlpacaModule,
    DiscoveryModule,
    MainCLIModule,
    UtilitiesModule.forRoot(),
  ],
  providers: [
    AlpacaAccountService,
    AlpacaOrderService,
    AlpacaPositionService,
    AssetService,
    TradeService,
  ],
})
export class TradeModule {}
