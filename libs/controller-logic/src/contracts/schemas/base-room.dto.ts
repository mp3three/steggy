import { BaseSchemaDTO } from '@automagical/persistence';
import { Prop } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, MinLength } from 'class-validator';

const MIN_LENGTH = 2;

export class BaseRoomDTO extends BaseSchemaDTO {
  @IsString()
  @Prop({ required: true, type: String })
  @IsOptional()
  @Expose()
  public description?: string;

  @IsString()
  @Prop({ required: true, type: String })
  @MinLength(MIN_LENGTH)
  @Expose()
  public friendlyName: string;

  @IsString()
  @Prop({ required: true, type: String })
  @MinLength(MIN_LENGTH)
  @Expose()
  public name: string;
}
