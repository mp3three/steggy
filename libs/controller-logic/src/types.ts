export const ENTITY_METADATA_UPDATED = 'ENTITY_METADATA_UPDATED';
export const ROOM_METADATA_UPDATED = 'ROOM_METADATA_UPDATED';

export interface MetadataUpdate {
  name: string;
  room: string;
  value: unknown;
}
