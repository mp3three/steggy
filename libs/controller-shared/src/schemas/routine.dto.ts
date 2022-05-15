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
  @Prop()
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

  @Prop()
  @IsOptional()
  @ApiProperty({ required: false })
  @IsBoolean()
  public sync?: boolean;
}
