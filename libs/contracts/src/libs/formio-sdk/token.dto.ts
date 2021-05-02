import { IsDate, IsOptional, IsString, Length } from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import faker from 'faker';

import { BaseDTO, timestamps } from '.';

@Schema({
  minimize: false,
  timestamps,
})
export class TokenDTO extends BaseDTO {
  // #region Object Properties

  @IsDate()
  @IsOptional()
  @Prop()
  public expireAt?: Date;
  @IsString()
  @Length(30, 30)
  @Prop({
    default: () => faker.random.alphaNumeric(30),
  })
  @IsOptional()
  public key!: string;
  @IsString()
  @Prop({ required: true })
  public value!: string;

  // #endregion Object Properties
}
