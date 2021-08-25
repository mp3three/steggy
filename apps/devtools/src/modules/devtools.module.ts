import { APP_DEVTOOLS } from '@automagical/contracts';
import { ConfigBuilderService, MainCLIModule } from '@automagical/tty';
import { ApplicationModule, UtilitiesModule } from '@automagical/utilities';

@ApplicationModule({
  application: APP_DEVTOOLS,
  imports: [UtilitiesModule, MainCLIModule, ConfigBuilderService],
})
export class DevtoolsModule {}
