import { MONGO_COLLECTIONS } from '@automagical/contracts/constants';
import { IsBoolean, IsOptional, IsString } from '@automagical/validation';
import { Prop, Schema } from '@nestjs/mongoose';

import { DBFake } from '../../classes';

@Schema({
  collection: MONGO_COLLECTIONS.role,
  minimize: false,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class RoleDTO extends DBFake {
  // #region Object Properties

  @IsBoolean()
  @IsOptional()
  @Prop({ default: false })
  public admin?: boolean;
  @IsBoolean()
  @IsOptional()
  @Prop({ default: false })
  public default?: boolean;
  @IsString()
  @IsOptional()
  @Prop({ default: '' })
  public description?: string;
  @IsString()
  @IsOptional()
  @Prop()
  public machineName?: string;
  @IsString()
  @Prop({
    index: true,
    required: true,
  })
  public title: string;

  // #endregion Object Properties
}
