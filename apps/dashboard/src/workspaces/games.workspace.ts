import { MDIIcons, Workspace } from '@automagical/terminal';
import chalk from 'chalk';

import { HOME_MENU } from '../typings';

@Workspace({
  friendlyName: 'Games',
  menu: [HOME_MENU, chalk` ${MDIIcons.dice_multiple}  {bold Games}`],
  name: 'games',
  roomRemote: true,
})
export class GamesWorkspace {}
