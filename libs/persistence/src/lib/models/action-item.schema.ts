import { ACTION_STATES } from '@automagical/contracts/formio-sdk';
import { Schema } from 'mongoose';
import {
  CreateSchema,
  deleted,
  form,
  project,
  submission,
  title,
} from './common.schema';

export const ActionItemDefinition = {
  title,
  project,
  form,
  deleted,
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
    type: [String],
  },
  data: {
    type: Schema.Types.Mixed,
  },
};

export const ActionItemSchema = CreateSchema(ActionItemDefinition, {
  expires: '30d',
  minimize: true,
});

ActionItemSchema.index({
  project: 1,
  state: 1,
  deleted: 1,
  modified: -1,
})
  .index({
    project: 1,
    handler: 1,
    deleted: 1,
    modified: -1,
  })
  .index({
    project: 1,
    handler: 1,
    method: 1,
    deleted: 1,
    modified: -1,
  });
