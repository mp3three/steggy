import { MDIIcons, Workspace } from '@automagical/terminal';

@Workspace({
  friendlyName: 'Games',
  menu: [` ${MDIIcons.dice_multiple}  Games`],
  name: 'games',
  roomRemote: true,
})
export class GamesWorkspace {}
