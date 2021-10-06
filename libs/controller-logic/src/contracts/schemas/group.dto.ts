import { Optional } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { BaseRoomDTO } from './base-room.dto';
import { RoomDTO } from './room.dto';

export enum GROUP_TYPES {
  light = 'light',
  fan = 'fan',
  switch = 'switch',
  lock = 'lock',
}
export type BASIC_STATE = { state: string };
@Schema({
  collection: `group`,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class GroupDTO<
  GROUP_STATE extends BASIC_STATE = BASIC_STATE,
> extends BaseRoomDTO {
  /**
   * A list of entity ids that can be looked up in home assistant
   */
  @Prop({ type: String })
  @IsString({ each: true })
  @Expose()
  public entities: string[];

  /**
   * Getting meta, a group of groups
   *
   * ? Is there a proper term for a group of groups?
   *
   * Aside from groupception
   */
  @Type(() => GroupDTO)
  @IsOptional()
  @Prop({
    default: null,
    ref: 'group',
    type: [MongooseSchema.Types.ObjectId],
  })
  @ValidateNested()
  @Expose()
  public groups?: GroupDTO[];

  /**
   * Reference to parent / owner room
   */
  @Type(() => RoomDTO)
  @IsOptional()
  @Prop({
    default: null,
    ref: 'room',
    type: MongooseSchema.Types.ObjectId,
  })
  @ValidateNested()
  @Expose()
  public owner?: RoomDTO;

  /**
   * A collection of rooms
   */
  @Type(() => RoomDTO)
  @IsOptional()
  @Prop({
    default: null,
    ref: 'room',
    type: [MongooseSchema.Types.ObjectId],
  })
  @ValidateNested()
  @Expose()
  public rooms?: RoomDTO[];

  /**
   * The current state of the group
   *
   * Generated at runtime / not persisted
   */
  @Expose()
  public state?: GROUP_STATE[];

  /**
   * Captured save states
   */
  @Type(() => GroupSaveStateDTO)
  @ValidateNested({ each: true })
  @Prop()
  @Expose()
  public states: GroupSaveStateDTO<GROUP_STATE>[];

  /**
   * What type of group
   */
  @IsEnum(GROUP_TYPES)
  @Prop({ enum: Object.values(GROUP_TYPES), type: String })
  @Expose()
  public type: GROUP_TYPES;
}

export class GroupSaveStateDTO<SAVE_STATE extends BASIC_STATE = BASIC_STATE> {
  /**
   * Generated id
   */
  @Expose()
  @IsString()
  @Optional()
  id?: string;

  /**
   * Human readable name for the save state
   */
  @IsString()
  @Expose()
  @MinLength(2)
  name: string;

  /**
   * Saved states
   */
  @IsArray()
  @Expose()
  states: SAVE_STATE[];
}

export type GroupDocument = GroupDTO & Document;
export const GroupSchema = SchemaFactory.createForClass(GroupDTO);
