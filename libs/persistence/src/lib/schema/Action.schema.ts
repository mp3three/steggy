import { SchemaDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SchemaSchema = SchemaDTO & Document;

export const SchemaSchema = SchemaFactory.createForClass(SchemaDTO);
SchemaSchema.index(
  { machineName: 1 },
  { unique: true, partialFilterExpression: { deleted: { $eq: null } } },
);
