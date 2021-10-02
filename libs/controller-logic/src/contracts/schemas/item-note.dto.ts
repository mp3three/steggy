import { BaseSchemaDTO } from '@automagical/persistence';
import { Prop, Schema } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Schema({
  collection: `note`,
})
export class ItemNoteDTO extends BaseSchemaDTO {
  @IsString()
  @Prop({ required: true, type: String })
  @Expose()
  friendlyName: string;
}
