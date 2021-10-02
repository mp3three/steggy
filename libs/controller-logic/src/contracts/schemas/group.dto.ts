import { Prop, Schema } from '@nestjs/mongoose';
import { Expose, Type } from 'class-transformer';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseRoomDTO } from './base-room.dto';
import { RoomDTO } from './room.dto';

export enum GROUP_TYPES {
  light = 'light',
  fan = 'fan',
  switch = 'switch',
  lock = 'lock',
}

@Schema({
  collection: `group`,
})
export class GroupDTO<T extends unknown = unknown> extends BaseRoomDTO {
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
   * Captured save states
   */
  @Type(() => GroupSaveState)
  @ValidateNested({ each: true })
  @Prop()
  @Expose()
  public states: GroupSaveState<T>[];

  /**
   * What type of group
   */
  @IsEnum(GROUP_TYPES)
  @Prop({ enum: Object.values(GROUP_TYPES), type: String })
  @Expose()
  public type: GROUP_TYPES;
}

export class GroupSaveState<T extends unknown = unknown> {
  @Expose()
  name: string;
  @Expose()
  states: T[];
}
