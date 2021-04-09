import { Schema } from 'mongoose';
import { owner, project } from './common.schema';

export const SessionDefinition = {
  submission: owner,
  project,
  form: {
    type: Schema.Types.ObjectId,
    ref: 'form',
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
};
export const SessionSchema = new Schema(SessionDefinition);
SessionSchema.set('minimize', false);
SessionSchema.pre('save', function (next: () => void) {
  // TODO Figure out how to attach `this` properly
  // eslint-disable-next-line
  // @ts-ignore
  this.modified = new Date();
  next();
});
