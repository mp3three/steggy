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
export enum CircadianModes {
  off = 'off',
  low = 'low',
  medium = 'medium',
  high = 'high',
}
export enum RoomScene {
  unknown = 'unknown',
  off = 'off',
  low = 'low',
  medium = 'medium',
  high = 'high',
}
export enum RoomModes {
  all = 'all',
  day = 'day',
  evening = 'evening',
}
export enum LightModes {
  off = 'off',
  on = 'on',
  acc = 'acc',
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
  high = 'high',
  medium = 'medium',
  low = 'low',
  off = 'off',
  favorite = 'favorite',
}
/**
 * Binding to
 */
export enum PicoStates {
  // Top
  high = '1',
  // Bottom
  off = '4',
  // Dimmer up
  medium = '8',
  // Dimmer down
  low = '16',
  // Favorite
  smart = '2',
  // Nothing being pressed
  none = '0',
}
