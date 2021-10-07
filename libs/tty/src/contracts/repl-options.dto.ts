export enum REPL_TYPE {
  home = 'home',
  maintenance = 'maintenance',
  misc = 'misc',
}

export class ReplOptions {
  public description?: string | string[];
  public icon?: string;
  public name: string;
  public type: REPL_TYPE;
}
