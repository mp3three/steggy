import { LibraryModule } from '@text-based/boilerplate';

import { LIB_RULES_ENGINE } from '../config';
import {
  CacheTestService,
  CustomCodeService,
  EntityAttributeService,
  RulesEngineService,
  TimeRangeService,
  WebhookService,
} from '../services';

@LibraryModule({
  exports: [RulesEngineService],
  library: LIB_RULES_ENGINE,
  providers: [
    CacheTestService,
    CustomCodeService,
    EntityAttributeService,
    RulesEngineService,
    TimeRangeService,
    WebhookService,
  ],
})
export class RulesEngineModule {}
