export class HomeAssistantEntityAttributes<
  T extends Record<never, unknown> = Record<never, unknown>
> {
  // #region Object Properties

  /**
   * Don't use this for unfriendly names. That's like dividing by zero
   */
  public friendly_name?: string;

  // #endregion Object Properties
}
