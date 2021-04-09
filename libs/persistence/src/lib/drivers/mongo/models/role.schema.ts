import { Schema, Types } from 'mongoose';

export const RoleDefinition = {
  project: {
    type: Schema.Types.ObjectId,
    ref: 'project',
    index: true,
    required: true,
  },
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
  owner: {
    type: Schema.Types.Mixed,
    ref: 'submission',
    index: true,
    default: null,
    set: (owner: string): Types.ObjectId => {
      // Attempt to convert to objectId.
      return Types.ObjectId(owner);
    },
    get: (owner: string): string => {
      return owner ? owner.toString() : owner;
    },
  },
  deleted: {
    type: Number,
    default: null,
  },
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
