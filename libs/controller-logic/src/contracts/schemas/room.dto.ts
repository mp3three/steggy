import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Document } from 'mongoose';

import { LightingCacheDTO } from '../dto';
import { BaseRoomDTO } from './base-room.dto';
import { BASIC_STATE, GroupDTO } from './group.dto';

export class RoomEntitySaveStateDTO {
  extra?: LightingCacheDTO | Record<string, unknown>;
  id: string;
  state: string;
}

export class RoomSaveStateDTO {
  entities: RoomEntitySaveStateDTO[];
  groups: Record<string, BASIC_STATE[]>;
  id: string;
  name: string;
}

/**
 * Entity types describe the capability / expectations of the entity as it relates to the controller logic
 *
 * These are not meant to be a subsitute for home assistant domain,
 * but a way of reducing the total number of operations a room can perform.
 * Also describes the information that needs to get persisted in save states
 */
export enum ROOM_ENTITY_TYPES {
  /**
   * Normal entities support turnOn / turnOff commands.
   * Does not imply anything about how turned on it is though (fans may turn on at 100%)
   *
   * Examples:
   *
   *  - media player
   *  - light
   *  - switch
   *  - fan
   */
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
  @IsOptional()
  @Prop({
    type: [String],
  })
  @IsString({ each: true })
  @Expose()
  public groups?: string[];

  /**
   * Not persisted
   */
  @Expose()
  @IsOptional()
  @Type(() => RoomSaveStateDTO)
  public state?: Partial<RoomSaveStateDTO>;
}

export type RoomDocument = RoomDTO & Document;
export const RoomSchema = SchemaFactory.createForClass(RoomDTO);
