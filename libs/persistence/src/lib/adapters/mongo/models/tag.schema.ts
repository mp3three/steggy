import { Schema } from 'mongoose';
import { CreateSchema, deleted, owner, project } from './common.schema';

export const TagDefinition = {
  project,
  owner,
  deleted,
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
};
export const TagSchema = CreateSchema(TagDefinition, {
  minimize: true,
});

TagSchema.set('minimize', false);
TagSchema.pre('save', function (next: () => void) {
  // TODO Figure out how to attach `this` properly
  // eslint-disable-next-line
  // @ts-ignore
  this.modified = new Date();
  next();
});
