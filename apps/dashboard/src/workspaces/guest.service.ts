import { FontAwesomeIcons, Workspace } from '@automagical/terminal';

@Workspace({
  friendlyName: `Guest`,
  menu: [` ${FontAwesomeIcons.user_circle_o}  Guest`],
  name: 'guest',
  roomRemote: true,
})
export class GuestService {}
