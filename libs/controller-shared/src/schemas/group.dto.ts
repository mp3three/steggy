import { TransformObjectId } from '@steggy/persistence';
import { is } from '@steggy/utilities';
import { Optional } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Document } from 'mongoose';

import { ROOM_ENTITY_EXTRAS, RoomEntitySaveStateDTO } from '../rooms';

export enum GROUP_TYPES {
  light = 'light',
  fan = 'fan',
  switch = 'switch',
  lock = 'lock',
}

export const GROUP_DEFINITIONS = new Map<GROUP_TYPES, string>([
  [
    GROUP_TYPES.light,
    [
      'Light groups may only contain light entities.',
      'Allow a set of lights to operate together performing the same function.',
    ].join(`\n`),
  ],
  [GROUP_TYPES.fan, 'Fan groups may only contain fan entities'],
  [
    GROUP_TYPES.switch,
    [
      'Switch groups may contain entities from the following domains:',
      ` - switch`,
      ` - light`,
      ` - climate`,
      ` - media`,
      ` - fan`,
    ].join(`\n`),
  ],
  [GROUP_TYPES.lock, 'Lock groups may only contain locks'],
]);

@Schema({
  collection: `group`,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class GroupDTO<
  GROUP_STATE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
> {
  public static isGroup(
    group: Partial<GroupDTO> | unknown = {},
  ): group is GroupDTO {
    return !is.undefined((group as GroupDTO)?._id);
  }
  /**
   * Autogenerated string
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  @TransformObjectId()
  public _id?: string;
  /**
   * Autogenerated creation date
   */
  @IsOptional()
  @ApiProperty({ required: false })
  @IsDateString()
  @Prop({
    index: true,
  })
  public created?: Date;

  @IsNumber()
  @ApiProperty({ required: false })
  @IsOptional()
  @Prop({ default: null, type: 'number' })
  public deleted?: number;

  /**
   * A list of entity ids that can be looked up in home assistant
   */
  @Prop()
  @IsString({ each: true })
  @ApiProperty()
  @Expose()
  public entities: string[];

  @IsString()
  @Prop({ required: true, type: 'string' })
  @ApiProperty()
  @Expose()
  public friendlyName: string;

  /**
   * Autogenerated last modified date
   */
  @IsOptional()
  @ApiProperty({ required: false })
  @IsDateString()
  @Prop({
    index: true,
  })
  public modified?: Date;

  /**
   * Captured save states
   */
  @Type(() => GroupSaveStateDTO)
  @ValidateNested({ each: true })
  @ApiProperty({ required: false })
  @Prop()
  @Expose()
  public save_states?: GroupSaveStateDTO<GROUP_STATE>[];

  /**
   * The current state of the group
   *
   * Generated at runtime / not persisted
   */
  @Expose()
  @ApiProperty({ required: false })
  public state?: Pick<GroupSaveStateDTO, 'states'>;

  /**
   * What type of group
   */
  @IsEnum(GROUP_TYPES)
  @Prop({ enum: Object.values(GROUP_TYPES), type: 'string' })
  @ApiProperty()
  @Expose()
  public type: GROUP_TYPES;
}

export class GroupSaveStateDTO<SAVE_STATE = ROOM_ENTITY_EXTRAS> {
  /**
   * Human readable name for the save state
   */
  @IsString()
  @Expose()
  @ApiProperty()
  @MinLength(2)
  public friendlyName: string;

  /**
   * Generated id
   */
  @Expose()
  @IsString()
  @ApiProperty({ required: false })
  @Optional()
  public id?: string;

  /**
   * Saved states
   */
  @IsArray()
  @ApiProperty()
  @Expose()
  public states: RoomEntitySaveStateDTO<SAVE_STATE>[];
}

export type GroupDocument = GroupDTO & Document;
export const GroupSchema = SchemaFactory.createForClass(GroupDTO);
