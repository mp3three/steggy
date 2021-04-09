import { AccessTypes } from '@automagical/contracts/formio-sdk';
import { Schema, Types } from 'mongoose';

export const owner = {
  type: Schema.Types.Mixed,
  ref: 'submission',
  index: true,
  default: null,
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

export const access = [
  {
    type: {
      enum: Object.values(AccessTypes),
      required: true,
      message:
        'A permission type is required to associate an available permission with a given role.',
    },
    roles: {
      ref: 'role',
      type: [Schema.Types.ObjectId],
    },
  },
];

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
  default: null,
};
