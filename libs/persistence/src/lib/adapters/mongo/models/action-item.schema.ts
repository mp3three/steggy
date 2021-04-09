import { Schema } from 'mongoose';
import { deleted, form, name, title } from './common.schema';

export const ActionDefinition = {
  title,
  name,
  form,
  deleted,
  handler: [
    {
      type: String,
      require: true,
    },
  ],
  method: [
    {
      type: String,
      require: true,
    },
  ],
  condition: {
    type: Schema.Types.Mixed,
    required: false,
  },
  priority: {
    type: Number,
    require: true,
    index: true,
    default: 0,
  },
  settings: {
    type: Schema.Types.Mixed,
    required: false,
  },
};
export const ActionSchema = new Schema(ActionDefinition);
