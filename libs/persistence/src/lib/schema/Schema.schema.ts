import { ActionDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActionDocument = ActionDTO & Document;

export const ActionSchema = SchemaFactory.createForClass(ActionDTO);
ActionSchema.index(
  { machineName: 1 },
  // eslint-disable-next-line unicorn/no-null
  { unique: true, partialFilterExpression: { deleted: { $eq: null } } },
);
