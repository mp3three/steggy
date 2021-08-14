import { MDIIcons, Workspace } from '@automagical/terminal';
import chalk from 'chalk';

@Workspace({
  friendlyName: 'Downstairs',
  menu: [chalk` ${MDIIcons.bowl}  {bold Downstairs}`],
  name: 'downstairs',
  roomRemote: true,
})
export class DownstairsWorkspace {}
