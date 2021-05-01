import { ACTION_STATES } from '@automagical/contracts/formio-sdk';
import { Schema } from 'mongoose';
import { form, submission, title } from './common.schema';

export const PermissionItemDefinition = {
  title,
  form,
  submission,
  action: {
    type: String,
    require: true,
  },
  handler: {
    type: String,
    require: true,
  },
  method: {
    type: String,
    require: true,
  },
  state: {
    type: String,
    enum: Object.values(ACTION_STATES),
    required: true,
    default: ACTION_STATES.new,
  },
  messages: {
    type: [],
  },
  data: {
    type: Schema.Types.Mixed,
  },
};
export const PermissionItemSchema = new Schema(PermissionItemDefinition);
