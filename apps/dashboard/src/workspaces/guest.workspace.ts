import { FontAwesomeIcons, Workspace } from '@automagical/terminal';
import chalk from 'chalk';

import { HOME_MENU } from '../typings';

@Workspace({
  friendlyName: `Guest`,
  menu: [HOME_MENU, chalk` ${FontAwesomeIcons.user_circle_o}  {bold Guest}`],
  name: 'guest',
  roomRemote: true,
})
export class GuestWorkspace {}
