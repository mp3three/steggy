import { DBFake } from '@automagical/contracts';
import {
  IsDateString,
  IsNumber,
  IsString,
  IsOptional,
} from '@automagical/validation';
import { Prop } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseOmitProperties } from '.';

/**
 * Common properties between all objects
 */
export abstract class BaseDTO extends DBFake {
  // #region Public Static Methods

  public static fake(): Omit<BaseDTO, BaseOmitProperties> {
    return {
      ...super.fake(),
      created: dayjs().toISOString(),
      modified: dayjs().toISOString(),
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  /**
   * Autogenerated creation date
   */
  @IsOptional()
  @IsDateString()
  @Prop({
    index: true,
    type: Date,
  })
  public created?: string;
  /**
   * Autogenerated last modified date
   */
  @IsOptional()
  @IsDateString()
  @Prop({
    index: true,
    type: Date,
  })
  public modified?: string;
  /**
   * If defined, then this must be a stage. ID reference to another project
   */
  @IsOptional()
  @IsString()
  @Prop({
    ref: 'project',
    type: MongooseSchema.Types.ObjectId,
    index: true,
    required: true,
    // eslint-disable-next-line unicorn/no-null
    default: null,
  })
  public project?: string;
  @IsOptional()
  // eslint-disable-next-line unicorn/no-null
  @Prop({ default: null })
  @IsNumber()
  public deleted?: number;
  /**
   * User ID for owner of this entity
   *
   * See Users collection in Portal Base
   */
  @IsString()
  @IsOptional()
  @Prop({ ref: 'submission', required: true, index: true })
  public owner?: string;

  // #endregion Object Properties
}
