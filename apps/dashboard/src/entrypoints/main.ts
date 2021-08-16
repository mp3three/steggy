import { UseTerminalLogger } from '@automagical/terminal';

import { Bootstrap } from '../environments/environment';
import { DashboardModule } from '../modules';

UseTerminalLogger();
Bootstrap(DashboardModule);
