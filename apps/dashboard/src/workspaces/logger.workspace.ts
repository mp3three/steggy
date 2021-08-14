import { FontAwesomeIcons, Workspace } from '@automagical/terminal';
import chalk from 'chalk';

@Workspace({
  defaultWorkspace: true,
  friendlyName: 'Logger',
  menu: [chalk` ${FontAwesomeIcons.server}  {bold Logger}`],
  name: 'logger',
})
export class LoggerWorkspace {}
