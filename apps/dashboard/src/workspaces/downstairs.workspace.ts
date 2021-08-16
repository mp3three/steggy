import { MDIIcons, Workspace } from '@automagical/terminal';
import chalk from 'chalk';

import { HOME_MENU } from '../typings';

@Workspace({
  friendlyName: 'Downstairs',
  menu: [HOME_MENU, chalk` ${MDIIcons.bowl}  {bold Downstairs}`],
  name: 'downstairs',
  roomRemote: true,
})
export class DownstairsWorkspace {}
