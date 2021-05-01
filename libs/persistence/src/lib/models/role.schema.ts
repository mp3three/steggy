import { Schema } from 'mongoose';
import { CreateSchema, deleted, owner, project } from './common.schema';

export const RoleDefinition = {
  project,
  tag: {
    type: String,
    maxlength: 32,
    required: true,
  },
  description: {
    type: String,
    maxlength: 256,
  },
  template: {
    type: Schema.Types.Mixed,
  },
  owner,
  deleted,
};
export const RoleSchema = CreateSchema(RoleDefinition, {
  machineName: true,
});
