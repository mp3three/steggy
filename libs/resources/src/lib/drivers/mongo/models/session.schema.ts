import { Schema, Types } from 'mongoose';

export const SessionSchema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'project',
    required: true,
  },
  form: {
    type: Schema.Types.ObjectId,
    ref: 'form',
  },
  submission: {
    type: Schema.Types.ObjectId,
    ref: 'submission',
    index: true,
    default: null,
    set: (owner) => {
      return Types.ObjectId(owner);
    },
    get: (owner?: string | Types.ObjectId) => {
      return (owner || '').toString();
    },
  },
  logout: {
    type: Date,
  },
  source: {
    type: String,
  },
  modified: {
    type: Date,
    index: true,
    __readonly: true,
  },
  created: {
    type: Date,
    index: true,
    default: Date.now,
    __readonly: true,
  },
});
SessionSchema.set('minimize', false);
SessionSchema.pre('save', function (next: () => void) {
  // TODO Figure out how to attach `this` properly
  // eslint-disable-next-line
  // @ts-ignore
  this.modified = new Date();
  next();
});
