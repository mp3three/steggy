import { Schema, Types } from 'mongoose';
import { PermissionDefinition } from './action.schema';

export const submission = {
  type: Schema.Types.Mixed,
  ref: 'submission',
  index: true,
  default: null,
};
export const owner = {
  ...submission,
  set: (owner: string): Types.ObjectId => {
    return Types.ObjectId(owner);
  },
  get: (owner?: string | Types.ObjectId): string => {
    return (owner || '').toString();
  },
};

export const name = {
  type: String,
  required: true,
  maxlength: 63,
  index: true,
  validate: [
    {
      message:
        'Name may only container numbers, letters, and dashes. Must not terminate with a dash',
      validator(value: string): boolean {
        return (
          !new RegExp('[0-9a-zA-Z-]').test(value) &&
          [value[0], value.substr(-1)].includes('-')
        );
      },
    },
  ],
};

export const permission = [PermissionDefinition];

export const project = {
  type: Schema.Types.ObjectId,
  ref: 'project',
  index: true,
  required: true,
};

export const form = {
  type: Schema.Types.ObjectId,
  ref: 'form',
  required: true,
  index: true,
};

export const title = {
  type: String,
  required: true,
  index: true,
  maxlength: 63,
};

export const deleted = {
  type: Number,
  index: true,
  default: null,
};
