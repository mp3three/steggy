import { Prop } from '@nestjs/mongoose';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

import { TransformObjectId } from '../decorators';

export class BaseSchemaDTO {
  /**
   * Sanitize incoming data of stuff it doesn't need to be setting
   */
  public static cleanup<T extends BaseSchemaDTO = BaseSchemaDTO>(
    data: T,
  ): Omit<T, keyof BaseSchemaDTO> {
    delete data._id;
    delete data.created;
    delete data.deleted;
    delete data.modified;
    return data;
  }
  /**
   * Autogenerated string
   */
  @IsOptional()
  @IsString()
  @TransformObjectId()
  public _id?: string;
  /**
   * Autogenerated creation date
   */
  @IsOptional()
  @IsDateString()
  @Prop({
    index: true,
  })
  public created?: Date;
  @IsNumber()
  @IsOptional()
  @Prop({ default: null, type: 'number' })
  public deleted?: number;
  /**
   * Autogenerated last modified date
   */
  @IsOptional()
  @IsDateString()
  @Prop({
    index: true,
  })
  public modified?: Date;
}