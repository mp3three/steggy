import { TagDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagDocument = TagDTO & Document;

export const TagSchema = SchemaFactory.createForClass(TagDTO);
TagSchema.index(
  { machineName: 1 },
  { unique: true, partialFilterExpression: { deleted: { $eq: null } } },
);
