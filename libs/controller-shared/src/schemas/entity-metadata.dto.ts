import { TransformObjectId } from '@automagical/persistence';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

@Schema({
  collection: `metadata`,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class MetadataDTO<DATA extends unknown = Record<string, unknown>> {
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

  @Prop({ type: 'object' })
  public data: DATA;

  @IsNumber()
  @ApiProperty({ required: false })
  @IsOptional()
  @Prop({ default: null, type: 'number' })
  public deleted?: number;

  /**
   * Autogenerated last modified date
   */
  @IsOptional()
  @ApiProperty({ required: false })
  @IsDateString()
  @Prop({ index: true })
  public modified?: Date;

  @IsString()
  @Prop({ index: true })
  public type: string;
}

export type MetadataDocument = MetadataDTO & Document;
export const MetadataSchema = SchemaFactory.createForClass(MetadataDTO);
