import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { TransformObjectId } from '@text-based/persistence';
import { is } from '@text-based/utilities';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { RoomStateDTO } from '../rooms';

export class RoomSettingDTO {
  /**
   * Future use: api key access for commands to be issued against this room
   */
  @IsString({ each: true })
  @ApiProperty({ required: false })
  public keys?: string[];
}

export class RoomEntityDTO {
  @ApiProperty()
  @IsString()
  public entity_id: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ each: true })
  public tags?: string[];
}

@Schema({
  collection: `room`,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class RoomDTO {
  public static isRoom(room: RoomDTO): room is RoomDTO {
    return !is.undefined(room._id);
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
  @Prop({ index: true })
  public created?: Date;

  @IsNumber()
  @ApiProperty({ required: false })
  @IsOptional()
  @Prop({ default: null, type: 'number' })
  public deleted?: number;

  @Expose()
  @ApiProperty({ required: false, type: [RoomEntityDTO] })
  @Prop()
  @IsString({ each: true })
  public entities?: RoomEntityDTO[];

  @IsString()
  @Prop({ required: true, type: 'string' })
  @ApiProperty()
  @Expose()
  public friendlyName: string;

  /**
   * Reference to group entries
   */
  @IsOptional()
  @Prop({ type: [String] })
  @IsString({ each: true })
  @ApiProperty({ required: false })
  @Expose()
  public groups?: string[];

  /**
   * Autogenerated last modified date
   */
  @IsOptional()
  @ApiProperty({ required: false })
  @IsDateString()
  @Prop({ index: true })
  public modified?: Date;

  @IsOptional()
  @ApiProperty({ required: false, type: [RoomStateDTO] })
  @ValidateNested()
  @Prop()
  public save_states?: RoomStateDTO[];

  /**
   * Encrypted json
   */
  @ValidateNested()
  @Type(() => RoomSettingDTO)
  @ApiProperty({ required: false, type: RoomSettingDTO })
  @IsOptional()
  public settings?: RoomSettingDTO;

  @IsObject()
  @Prop({ type: MongooseSchema.Types.Mixed })
  @IsOptional()
  public storage?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  @Exclude()
  @Prop()
  /**
   * Encrypted json from project settings
   */
  protected settings_encrypted?: string;
}

export type RoomDocument = RoomDTO & Document;
export const RoomSchema = SchemaFactory.createForClass(RoomDTO);
