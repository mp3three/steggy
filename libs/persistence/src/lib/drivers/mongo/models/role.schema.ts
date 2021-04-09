import { Schema } from 'mongoose';
import { deleted, owner, project } from './common.schema';

export const RoleDefinition = {
  project,
  tag: {
    type: String,
    description: 'The tag identifier.',
    maxlength: 32,
    required: true,
  },
  description: {
    type: String,
    maxlength: 256,
  },
  template: {
    type: Schema.Types.Mixed,
    description: 'The project template.',
  },
  owner,
  deleted,
};
export const RoleSchema = new Schema(RoleDefinition);

RoleSchema.set('minimize', false);
RoleSchema.pre('save', function (next: () => void) {
  // TODO Figure out how to attach `this` properly
  // eslint-disable-next-line
  // @ts-ignore
  this.modified = new Date();
  next();
});
