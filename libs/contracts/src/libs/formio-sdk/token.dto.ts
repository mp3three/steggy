import { MONGO_COLLECTIONS } from '@automagical/contracts/constants';
import { Prop, Schema } from '@nestjs/mongoose';
import { IsDate, IsOptional, IsString, Length } from 'class-validator';
import faker from 'faker';

import { DBFake } from '../../classes';
import { BaseOmitProperties } from '.';

@Schema({
  collection: MONGO_COLLECTIONS.tokens,
  minimize: false,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class TokenDTO extends DBFake {
  // #region Public Static Methods

  public static fake(
    mixin: Partial<TokenDTO> = {},
    withID = false,
  ): Omit<TokenDTO, BaseOmitProperties> {
    return {
      ...(withID ? super.fake() : {}),
      key: faker.random.alphaNumeric(30),
      value: faker.random.alphaNumeric(30),
      ...mixin,
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsDate()
  @IsOptional()
  @Prop()
  public expireAt?: Date;
  @IsString()
  @Length(30, 30)
  @IsOptional()
  @Prop({
    // If you don't like it, provide a value
    default: () => faker.random.alphaNumeric(30),
  })
  @IsOptional()
  public key: string;
  @IsString()
  @Prop({ required: true })
  public value: string;

  // #endregion Object Properties
}
