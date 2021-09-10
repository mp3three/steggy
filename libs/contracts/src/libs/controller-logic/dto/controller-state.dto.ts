export class ControllerStateDTO<T extends unknown = unknown> {
  public ACTIVE_CONTROLLERS: string[];
  public CONTROLLER_STATE: Record<string, T>;
}
