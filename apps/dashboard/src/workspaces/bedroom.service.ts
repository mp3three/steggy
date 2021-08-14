import { FontAwesomeIcons, Workspace } from '@automagical/terminal';

@Workspace({
  friendlyName: 'Bedroom',
  menu: [` ${FontAwesomeIcons.bed}  Bedroom`],
  name: 'bedroom',
  roomRemote: true,
})
export class BedroomService {}
