import {
  IsBoolean,
  IsOptional,
  IsSemVer,
  IsString,
} from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { timestamps } from '.';
import { DBFake } from '@automagical/contracts';

@Schema({
  minimize: false,
  timestamps,
})
export class SchemaDTO extends DBFake {
  // #region Object Properties

  @IsBoolean()
  @Prop({ default: false })
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
