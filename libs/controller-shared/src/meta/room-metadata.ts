export class RoomMetadataDTO {
  id: string;
  name: string;
  type: 'string' | 'boolean' | 'number';
  value: string | boolean | number;
}
