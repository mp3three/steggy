import { TagDTO } from '@formio/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagDocument = TagDTO & Document;

export const TagSchema = SchemaFactory.createForClass(TagDTO);
