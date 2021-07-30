export class ControllerStateDTO<T extends unknown = unknown> {
  // #region Object Properties

  public ACTIVE_CONTROLLERS: string[];
  public CONTROLLER_STATE: Record<string, T>;

  // #endregion Object Properties
}
