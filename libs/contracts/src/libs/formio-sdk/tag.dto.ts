import { MONGO_COLLECTIONS } from '@automagical/contracts/constants';
import { Prop, Schema } from '@nestjs/mongoose';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import faker from 'faker';
import { Schema as MongooseSchema } from 'mongoose';

import { DBFake } from '../../classes';
import { BaseOmitProperties } from '.';

@Schema({
  collection: MONGO_COLLECTIONS.tags,
  minimize: false,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class TagDTO<
  TEMPLATE extends Record<never, unknown> = Record<string, unknown>
> extends DBFake {
  // #region Public Static Methods

  public static fake(
    mixin: Partial<TagDTO> = {},
    withID = false,
  ): Omit<TagDTO, BaseOmitProperties> {
    return {
      ...(withID ? super.fake() : {}),
      tag: faker.random.alphaNumeric(10),
      template: {},
      ...mixin,
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsNumber()
  @IsOptional()
  @Prop({ default: null })
  public deleted?: number;
  @IsString()
  @MaxLength(256)
  @IsOptional()
  @Prop({
    maxlength: 256,
  })
  public description?: string;
  @IsString()
  @MaxLength(32)
  @Prop({
    maxlength: 32,
    required: true,
  })
  public tag: string;
  @ValidateNested()
  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  public template: TEMPLATE;

  // #endregion Object Properties
}
