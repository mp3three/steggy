import { RoleDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = RoleDTO & Document;

export const RoleSchema = SchemaFactory.createForClass(RoleDTO);
RoleSchema.index(
  { machineName: 1 },
  // eslint-disable-next-line unicorn/no-null
  { unique: true, partialFilterExpression: { deleted: { $eq: null } } },
);
