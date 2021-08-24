import { APP_DEVTOOLS } from '@automagical/contracts';
import { MainCLIModule } from '@automagical/tty';
import { ApplicationModule, UtilitiesModule } from '@automagical/utilities';

import { YoinkService } from '../services';

@ApplicationModule({
  application: APP_DEVTOOLS,
  imports: [UtilitiesModule, MainCLIModule],
  providers: [YoinkService],
})
export class DevtoolsModule {}
