import { TransformObjectId } from '@automagical/persistence';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Document } from 'mongoose';

import { RoomStateDTO } from '../rooms';

export class RoomSettingDTO {
  /**
   * Future use: api key access for commands to be issued against this room
   */
  @IsString({ each: true })
  public keys?: string[];
}

export class RoomEntityDTO {
  entity_id: string;
  tags?: string[];
}

@Schema({
  collection: `room`,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class RoomDTO {
  /**
   * Autogenerated string
   */
  @IsOptional()
  @IsString()
  @TransformObjectId()
  public _id?: string;
  /**
   * Autogenerated creation date
   */
  @IsOptional()
  @IsDateString()
  @Prop({ index: true })
  public created?: Date;

  @IsNumber()
  @IsOptional()
  @Prop({ default: null, type: 'number' })
  public deleted?: number;

  @Expose()
  @Prop()
  @IsString({ each: true })
  public entities?: RoomEntityDTO[];

  @IsString()
  @Prop({ required: true, type: 'string' })
  @Expose()
  public friendlyName: string;

  /**
   * Reference to group entries
   */
  @IsOptional()
  @Prop({ type: [String] })
  @IsString({ each: true })
  @Expose()
  public groups?: string[];

  /**
   * Autogenerated last modified date
   */
  @IsOptional()
  @IsDateString()
  @Prop({ index: true })
  public modified?: Date;

  @IsOptional()
  @ValidateNested()
  @Prop()
  public save_states?: RoomStateDTO[];

  /**
   * Encrypted json
   */
  @ValidateNested()
  @Type(() => RoomSettingDTO)
  @IsOptional()
  public settings?: RoomSettingDTO;

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
