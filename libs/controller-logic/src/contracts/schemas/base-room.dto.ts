import { BaseSchemaDTO } from '@automagical/persistence';
import { Prop } from '@nestjs/mongoose';
import { Expose, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

import { ItemNoteDTO } from './item-note.dto';

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

  @ValidateNested()
  @IsOptional()
  @Type(() => ItemNoteDTO)
  @Prop({
    default: null,
    ref: 'note',
    type: MongooseSchema.Types.ObjectId,
  })
  @Expose()
  public notes?: ItemNoteDTO[];
}
