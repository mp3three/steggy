import { FontAwesomeIcons, Workspace } from '@automagical/terminal';
import chalk from 'chalk';

@Workspace({
  friendlyName: `Guest`,
  menu: [chalk` ${FontAwesomeIcons.user_circle_o}  {bold Guest}`],
  name: 'guest',
  roomRemote: true,
})
export class GuestWorkspace {}
