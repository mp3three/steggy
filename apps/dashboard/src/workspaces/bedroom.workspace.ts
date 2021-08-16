import { FontAwesomeIcons, Workspace } from '@automagical/terminal';
import chalk from 'chalk';

import { HOME_MENU } from '../typings';

@Workspace({
  friendlyName: 'Bedroom',
  menu: [HOME_MENU, chalk` ${FontAwesomeIcons.bed}  {bold Bedroom}`],
  name: 'bedroom',
  roomRemote: true,
})
export class BedroomWorkspace {}
