import { SchemaDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SchemaDocument = SchemaDTO & Document;

export const SchemaDocument = SchemaFactory.createForClass(SchemaDTO);
SchemaDocument.index(
  { machineName: 1 },
  { unique: true, partialFilterExpression: { deleted: { $eq: null } } },
);
