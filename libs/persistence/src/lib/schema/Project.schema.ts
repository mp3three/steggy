import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = ProjectDTO & Document;

export const ProjectSchema = SchemaFactory.createForClass(ProjectDTO);
ProjectSchema.index(
  { machineName: 1 },
  // eslint-disable-next-line unicorn/no-null
  { unique: true, partialFilterExpression: { deleted: { $eq: null } } },
);
