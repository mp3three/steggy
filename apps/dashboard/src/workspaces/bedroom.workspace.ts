import { FontAwesomeIcons, Workspace } from '@automagical/terminal';
import chalk from 'chalk';

@Workspace({
  friendlyName: 'Bedroom',
  menu: [chalk` ${FontAwesomeIcons.bed}  {bold Bedroom}`],
  name: 'bedroom',
  roomRemote: true,
})
export class BedroomWorkspace {}
