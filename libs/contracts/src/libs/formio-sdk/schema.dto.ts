import { Prop, Schema } from '@nestjs/mongoose';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsSemVer,
  IsString,
} from 'class-validator';
import faker from 'faker';

import { DBFake } from '../../classes';
import { MONGO_COLLECTIONS } from '../persistence/mongo';
import { BaseOmitProperties } from '.';

@Schema({
  collection: MONGO_COLLECTIONS.schema,
  minimize: false,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class SchemaDTO extends DBFake {
  // #region Public Static Methods

  public static fake(
    mixin: Partial<SchemaDTO> = {},
    withID = false,
  ): Omit<SchemaDTO, BaseOmitProperties> {
    return {
      ...(withID ? super.fake() : {}),
      isLocked: false,
      key: faker.random.alphaNumeric(20),
      value: faker.random.alphaNumeric(20),
      ...mixin,
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsBoolean()
  @IsOptional()
  @Prop({
    default: false,
  })
  public isLocked?: boolean;
  @IsNumber()
  @IsOptional()
  @Prop({ default: null })
  public deleted?: number;
  @IsSemVer()
  @IsOptional()
  @Prop({
    default: null,
  })
  public version?: string;
  @IsString()
  @IsOptional()
  @Prop({
    default: null,
  })
  public value: string;
  @IsString()
  @Prop({
    required: true,
  })
  public key: string;

  // #endregion Object Properties
}
