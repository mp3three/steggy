import {
  IsDateString,
  IsNumber,
  IsObjectId,
  IsOptional,
} from '@automagical/validation';
import { Prop } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Schema as MongooseSchema } from 'mongoose';
import { DBFake } from '../../classes/DBFake.dto';

export type BaseOmitProps = 'owner' | 'project';
export const timestamps = {
  updatedAt: 'modified',
  createdAt: 'created',
};
/**
 * Common properties between all objects
 */
export abstract class BaseDTO extends DBFake {
  // #region Public Static Methods

  public static fake(): Omit<BaseDTO, BaseOmitProps> {
    return {
      ...super.fake(),
      created: dayjs().toISOString(),
      modified: dayjs().toISOString(),
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  /**
   * User ID for owner of this entity
   *
   * See Users collection in Portal Base
   */
  @IsObjectId()
  @IsOptional()
  @Prop({ ref: 'submission', required: true, index: true })
  public owner?: string;
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
   * If this is defined, then this must be a stage. ID reference to another project
   */
  @IsOptional()
  @IsObjectId()
  @Prop({
    ref: 'project',
    type: MongooseSchema.Types.ObjectId,
    index: true,
    required: true,
    default: null,
  })
  public project?: string;
  @IsOptional()
  @Prop({ default: null })
  @IsNumber()
  public deleted?: number;

  // #endregion Object Properties
}
