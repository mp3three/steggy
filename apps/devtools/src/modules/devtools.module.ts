import { APP_DEVTOOLS } from '@automagical/contracts';
import { MainCLIModule } from '@automagical/tty';
import { ApplicationModule, UtilitiesModule } from '@automagical/utilities';

import { ConfigBuilderService } from '../services';

@ApplicationModule({
  application: APP_DEVTOOLS,
  imports: [UtilitiesModule, MainCLIModule, ConfigBuilderService],
})
export class DevtoolsModule {}
