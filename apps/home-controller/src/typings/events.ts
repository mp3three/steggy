import { ROOM_NAMES } from './room-names';

/**
 * Generic 'stuff is happening' event
 */
export const GLOBAL_TRANSITION = 'GLOBAL_TRANSITION';
export const ROOM_FAVORITE = (room: ROOM_NAMES): string => `favorite/${room}`;
