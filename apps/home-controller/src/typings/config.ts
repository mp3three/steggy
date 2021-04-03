export class ApplicationConfig {
  // #region Object Properties

  public MQTT_HOST: string;
  public MQTT_PORT: number;

  // #endregion Object Properties
}

export const BEDROOM_CONFIG = Symbol('BEDROOM_CONFIG');
export const GAMES_CONFIG = Symbol('GAMES_CONFIG');
export const GARAGE_CONFIG = Symbol('GARAGE_CONFIG');
export const GUEST_CONFIG = Symbol('GUEST_CONFIG');
export const LOFT_CONFIG = Symbol('LOFT_CONFIG');
export const LIVING_ROOM_CONFIG = Symbol('LIVING_ROOM_CONFIG');
