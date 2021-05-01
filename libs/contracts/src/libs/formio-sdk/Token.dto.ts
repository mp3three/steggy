import { IsBoolean, IsOptional, IsString } from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';
import { BaseDTO, CanFake, timestamps } from './Base.dto';

@Schema({
  minimize: false,
  timestamps,
})
export class TokenDTO extends CanFake {
  // #region Object Properties

  @IsString()
  @Prop({})
  public machineName: string;
  @Prop({
    required: true,
    index: true,
  })
  @IsString()
  public title: string;
  @Prop({ default: false })
  @IsOptional()
  @IsBoolean()
  public admin?: boolean;
  @Prop({ default: false })
  @IsOptional()
  @IsBoolean()
  public default?: boolean;
  @Prop({ default: '' })
  @IsString()
  @IsOptional()
  public description?: string;

  // #endregion Object Properties
}
