import { MDIIcons, Workspace } from '@automagical/terminal';
import chalk from 'chalk';

@Workspace({
  friendlyName: 'Games',
  menu: [chalk` ${MDIIcons.dice_multiple}  {bold Games}`],
  name: 'games',
  roomRemote: true,
})
export class GamesWorkspace {}
