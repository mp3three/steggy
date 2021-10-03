import { BaseSchemaDTO } from '@automagical/persistence';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { Document } from 'mongoose';

@Schema({
  collection: `note`,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class ItemNoteDTO extends BaseSchemaDTO {
  @IsString()
  @Prop({ required: true, type: String })
  @Expose()
  public body: string;
  @IsString()
  @Prop({ required: true, type: String })
  @Expose()
  public friendlyName: string;
}

export type ItemNoteDocument = ItemNoteDTO & Document;
export const ItemNoteSchema = SchemaFactory.createForClass(ItemNoteDTO);
