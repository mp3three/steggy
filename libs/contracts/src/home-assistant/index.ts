export * from './enums';
export * from './hass-event.dto';
export * from './hass-state.dto';
export * from './socket-message.dto';

/**
 * home-assistant/SocketService#updateAllEntities
 */
export const ALL_ENTITIES_UPDATED = Symbol('ALL_ENTITIES_UPDATED');
/**
 * home-assistant/SocketService#initConnection
 */
export const CONNECTION_RESET = Symbol('CONNECTION_RESET');
/**
 * home-assistant/SocketService#onMessage
 */
export const HA_RAW_EVENT = Symbol('HA_RAW_EVENT');
