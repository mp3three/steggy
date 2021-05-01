import { SessionDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = SessionDTO & Document;

export const SessionDocument = SchemaFactory.createForClass(SessionDTO);
SessionDocument.index(
  { machineName: 1 },
  { unique: true, partialFilterExpression: { deleted: { $eq: null } } },
);
