import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { TransformObjectId } from '@steggy/utilities';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { MINIMUM_NAME_SIZE } from '../constants';
import {
  RoutineActivateDTO,
  RoutineCommandDTO,
  RoutineEnableDTO,
} from '../routines';

export enum ROUTINE_SCOPE {
  public,
  http,
}
const each = true;
const index = true;

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
  @ValidateNested({ each })
  @ApiProperty({ required: false, type: [RoutineActivateDTO] })
  @Prop({ default: [] })
  public activate?: RoutineActivateDTO[];

  @IsOptional()
  @ValidateNested({ each })
  @ApiProperty({ required: false, type: [RoutineCommandDTO] })
  @Prop({ default: [] })
  public command?: RoutineCommandDTO[];

  /**
   * Autogenerated creation date
   */
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  @Prop({ index })
  public created?: Date;

  @IsNumber()
  @IsOptional()
  @Prop({ default: null, type: 'number' })
  @ApiProperty({ required: false })
  public deleted?: number;

  /**
   * Human readable/provided long form description
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  @Prop()
  public description?: string;

  @ValidateNested()
  @IsOptional()
  @ApiProperty({ required: false, type: [RoutineEnableDTO] })
  @Prop({ default: { type: 'enable' } as RoutineEnableDTO })
  public enable?: RoutineEnableDTO;

  @IsString()
  @Prop({ required: true, type: 'string' })
  @ApiProperty()
  @MinLength(MINIMUM_NAME_SIZE)
  public friendlyName: string;

  /**
   * Autogenerated last modified date
   */
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  @Prop({ index })
  public modified?: Date;

  /**
   * ID reference to another routine
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  @TransformObjectId()
  @Prop({ index })
  public parent?: string;

  @IsOptional()
  @Prop()
  @IsEnum(['normal', 'queue', 'block', 'interrupt'])
  public repeat?: 'normal' | 'queue' | 'block' | 'interrupt';

  @Prop({ default: false })
  @IsOptional()
  @ApiProperty({ required: false })
  @IsBoolean()
  public sync?: boolean;

  @Prop({ default: [] })
  @IsOptional()
  @ApiProperty({ type: [String] })
  @IsString({ each })
  public tags?: string[];
}
