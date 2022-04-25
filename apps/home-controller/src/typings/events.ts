/**
 * Generic 'stuff is happening' event
 */
export const GLOBAL_TRANSITION = 'GLOBAL_TRANSITION';
export const ENTITY_METADATA_UPDATED = (type: string) =>
  `ENTITY_METADATA_UPDATED_${type}`;
export const ROOM_METADATA_UPDATED = 'ROOM_METADATA_UPDATED';
export const PERSON_METADATA_UPDATED = 'PERSON_METADATA_UPDATED';
export const ROUTINE_ACTIVATE = 'ROUTINE_ACTIVATE';

export interface MetadataUpdate {
  name: string;
  room?: string;
  value: unknown;
}
export class RoutineTriggerEvent {
  public routine: string;
  public runId: string;
  public source: string;
  public time: number;
}
