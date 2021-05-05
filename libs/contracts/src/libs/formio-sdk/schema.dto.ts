import { DBFake } from '@automagical/contracts';
import { MONGO_COLLECTIONS } from '@automagical/contracts/constants';
import {
  IsBoolean,
  IsOptional,
  IsSemVer,
  IsString,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import faker from 'faker';

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
  isLocked!: boolean;
  @IsSemVer()
  @IsOptional()
  @Prop({
    default: null,
  })
  version?: string;
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
