import { MONGO_COLLECTIONS } from '@automagical/contracts/constants';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

import { DBFake } from '../../classes';
import { BaseOmitProperties } from '.';

@Schema({
  collection: MONGO_COLLECTIONS.sessions,
  minimize: false,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class SessionDTO extends DBFake {
  // #region Public Static Methods

  public static fake(
    mixin: Partial<SessionDTO> = {},
    withID = false,
  ): Omit<SessionDTO, BaseOmitProperties> {
    return {
      ...(withID ? super.fake() : {}),
      form: Types.ObjectId().toHexString(),
      submission: Types.ObjectId().toHexString(),
      ...mixin,
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsDate()
  @IsOptional()
  @Prop()
  public logout?: Date;
  @IsNumber()
  @IsOptional()
  @Prop({ default: null })
  public deleted?: number;
  @IsString()
  @IsOptional()
  @Prop()
  public source?: string;
  @IsString()
  @IsOptional()
  @Prop({
    default: null,
    index: true,
    ref: MONGO_COLLECTIONS.projects,
    type: MongooseSchema.Types.ObjectId,
  })
  public project?: string;
  @IsString()
  @Prop({
    index: true,
    ref: MONGO_COLLECTIONS.forms,
    required: true,
  })
  public form: string;
  @IsString()
  @Prop({
    index: true,
    ref: MONGO_COLLECTIONS.submissions,
    required: true,
  })
  public submission: string;

  // #endregion Object Properties
}
