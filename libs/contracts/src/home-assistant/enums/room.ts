export enum RokuInputs {
  off = 'off',
  hdmi1 = 'hdmi1',
  hdmi2 = 'hdmi2',
  hdmi3 = 'hdmi3',
}

export enum RoomCode {
  loft = 'loft',
  living = 'living_room',
  bedroom = 'bedroom',
  games = 'games',
  guest = 'guest',
  kitchen = 'kitchen',
  garage = 'garage',
}

export enum FanSpeeds {
  high = 'high',
  medium_high = 'medium_high',
  medium = 'medium',
  low = 'low',
  off = 'off',
}

/**
 * The basic enum
 */
export enum PicoButtons {
  on = 'high',
  up = 'medium',
  down = 'low',
  off = 'off',
  favorite = 'favorite',
}
/**
 * Binding to
 */
export enum PicoStates {
  // Top
  on = '1',
  // Bottom
  off = '4',
  // Dimmer up
  up = '8',
  // Dimmer down
  down = '16',
  // Favorite
  favorite = '2',
  // Nothing being pressed
  none = '0',
}
