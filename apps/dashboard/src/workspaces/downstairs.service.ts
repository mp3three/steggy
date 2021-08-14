import { MDIIcons, Workspace } from '@automagical/terminal';

@Workspace({
  friendlyName: 'Downstairs',
  menu: [` ${MDIIcons.bowl}  Downstairs`],
  name: 'downstairs',
  roomRemote: true,
})
export class DownstairsService {}
