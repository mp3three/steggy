export class GroupSetStateDTO<T extends unknown = Record<string, unknown>> {
  public entity_id: string;
  public extra?: T;
  public state: string;
}
