import { SessionDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = SessionDTO & Document;

export const SessionSchema = SchemaFactory.createForClass(SessionDTO);
SessionSchema.index(
  { machineName: 1 },
  // eslint-disable-next-line unicorn/no-null
  { partialFilterExpression: { deleted: { $eq: null } }, unique: true },
);
