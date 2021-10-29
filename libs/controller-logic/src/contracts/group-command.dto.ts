export class GroupLightCommandExtra {
  public brightness?: number;
}
export type GROUP_LIGHT_COMMANDS =
  | 'turnOn'
  | 'turnOff'
  | 'circadianOn'
  | 'dimUp'
  | 'dimDown';

export class GroupCommandDTO<EXTRA = GroupLightCommandExtra, COMMAND = string> {
  public command: COMMAND;
  public extra?: EXTRA;
}
