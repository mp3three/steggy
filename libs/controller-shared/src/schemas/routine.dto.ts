import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { TransformObjectId } from '@steggy/persistence';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Document } from 'mongoose';

import {
  RoutineActivateDTO,
  RoutineCommandDTO,
  RoutineEnableDTO,
} from '../routines';

export enum ROUTINE_SCOPE {
  public,
  http,
}

@Schema({
  collection: `routines`,
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
})
export class RoutineDTO {
  /**
   * Autogenerated string
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  @TransformObjectId()
  public _id?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @ApiProperty({ required: false, type: [RoutineActivateDTO] })
  @Prop()
  public activate?: RoutineActivateDTO[];

  @IsOptional()
  @ValidateNested({ each: true })
  @ApiProperty({ required: false, type: [RoutineCommandDTO] })
  @Prop()
  public command?: RoutineCommandDTO[];

  /**
   * Autogenerated creation date
   */
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  @Prop({ index: true })
  public created?: Date;

  @IsNumber()
  @IsOptional()
  @Prop({ default: null, type: 'number' })
  @ApiProperty({ required: false })
  public deleted?: number;

  @ValidateNested()
  @IsOptional()
  @ApiProperty({ required: false, type: [RoutineEnableDTO] })
  @Prop()
  public enable?: RoutineEnableDTO;

  @IsString()
  @Prop({ required: true, type: 'string' })
  @ApiProperty()
  public friendlyName: string;

  /**
   * Autogenerated last modified date
   */
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  @Prop({ index: true })
  public modified?: Date;

  /**
   * ID reference to another routine
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  @TransformObjectId()
  @Prop({ index: true })
  public parent?: string;

  @IsOptional()
  @Prop()
  @IsEnum(['normal', 'queue', 'block', 'interrupt'])
  public repeat?: 'normal' | 'queue' | 'block' | 'interrupt';

  /**
   * Room that owns this routine
   */
  @Prop({ index: true })
  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  @TransformObjectId()
  public room?: string;

  @Prop()
  @IsOptional()
  @ApiProperty({ required: false })
  @IsBoolean()
  public sync?: boolean;
}

export type RountineDocument = RoutineDTO & Document;
export const RoutineSchema = SchemaFactory.createForClass(RoutineDTO);
RoutineSchema.index({ deleted: 1 });
RoutineSchema.index({ deleted: 1, friendlyName: 1 });
