export class HomeAssistantEntityAttributes {
  public area_name?: string;
  /**
   * Don't use this for unfriendly names. That's like dividing by zero
   */
  public friendly_name?: string;
  public integration_id?: number;
}
