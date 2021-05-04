import { DBFake } from '@automagical/contracts';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
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
      created: dayjs().toDate(),
      modified: dayjs().toDate(),
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
  })
  public created?: Date;
  /**
   * Autogenerated last modified date
   */
  @IsOptional()
  @IsDateString()
  @Prop({
    index: true,
  })
  public modified?: Date;
  /**
   * If defined, then this must be a stage. ID reference to another project
   */
  @IsOptional()
  @IsString()
  @Prop({
    // eslint-disable-next-line unicorn/no-null
    default: null,
    index: true,
    ref: 'project',
    required: true,
    type: MongooseSchema.Types.ObjectId,
  })
  public project?: string;
  @IsNumber()
  @IsOptional()
  // eslint-disable-next-line unicorn/no-null
  @Prop({ default: null })
  public deleted?: number;
  /**
   * User ID for owner of this entity
   *
   * See Users collection in Portal Base
   */
  @IsString()
  @IsOptional()
  // @Prop({ index: true, ref: 'submission', required: true })
  public owner?: string;

  // #endregion Object Properties
}
