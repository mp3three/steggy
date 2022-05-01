/**
 * One scope does NOT imply the others
 */
export enum RoomCommandScope {
  /**
   * Run against local devices
   */
  LOCAL = 'LOCAL',
  /**
   * Affect secondary devices
   */
  ACCESSORIES = 'ACCESSORIES',
}

/**
 * Affect the way a command is processed by the system
 */
export class RoomCommandDTO {
  increment?: number;
  scope?: RoomCommandScope | RoomCommandScope[];
}
