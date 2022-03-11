import { TransformObjectId } from '@automagical/persistence';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

@Schema({
  collection: `entity-metadata`,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class EntityMetadataDTO {
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

  @IsString()
  @Prop({ index: true })
  public entity: string;

  @IsOptional()
  @IsString({ each: true })
  @Prop()
  public flags?: string[];
  /**
   * Autogenerated last modified date
   */
  @IsOptional()
  @ApiProperty({ required: false })
  @IsDateString()
  @Prop({ index: true })
  public modified?: Date;
}

export type EntityMetadataDocument = EntityMetadataDTO & Document;
export const EntityMetadataSchema =
  SchemaFactory.createForClass(EntityMetadataDTO);
