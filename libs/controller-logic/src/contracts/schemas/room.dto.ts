import { GroupDTO } from '@automagical/controller-logic';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Document } from 'mongoose';

import { BaseRoomDTO } from './base-room.dto';

export enum ROOM_ENTITY_TYPES {
  normal = 'normal',
  /**
   * Accessories turn on in response to custom logic, and specially flagged turnOn commands
   *
   * Turn off as normal with an turn off command
   */
  accessory = 'accessory',
}

export class RoomEntityDTO {
  entity_id: string;
  type: ROOM_ENTITY_TYPES;
}

@Schema({
  collection: `room`,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class RoomDTO extends BaseRoomDTO {
  @Type(() => RoomEntityDTO)
  @Expose()
  @Prop()
  @ValidateNested()
  public entities?: RoomEntityDTO[];

  /**
   * Reference to group entries. References the `name` attribute of the group
   */
  @Type(() => GroupDTO)
  @IsOptional()
  @Prop({
    type: [String],
  })
  @IsString({ each: true })
  @Expose()
  public groups?: string[];
}

export type RoomDocument = RoomDTO & Document;
export const RoomSchema = SchemaFactory.createForClass(RoomDTO);
