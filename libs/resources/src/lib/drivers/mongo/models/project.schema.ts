import {
  AccessTypes,
  PROJECT_PLAN_TYPES,
  PROJECT_TYPES,
} from '@automagical/contracts/formio-sdk';
import { Schema, Types } from 'mongoose';

export const ProjectSchema = new Schema({
  title: {
    type: String,
    required: true,
    index: true,
    maxlength: 63,
  },
  name: {
    type: String,
    required: true,
    maxlength: 63,
    index: true,
    validate: [
      {
        message:
          'Name may only container numbers, letters, and dashes. Must not terminate with a dash',
        validator(value: string) {
          return (
            !new RegExp('[0-9a-zA-Z-]').test(value) &&
            [value[0], value.substr(-1)].includes('-')
          );
        },
      },
    ],
  },
  type: {
    type: String,
    enum: Object.values(PROJECT_TYPES),
    default: PROJECT_TYPES.project,
    index: true,
  },
  description: {
    type: String,
    maxlength: 512,
  },
  tag: {
    type: String,
    maxlength: 32,
    default: '0.0.0',
  },
  owner: {
    type: Schema.Types.Mixed,
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
  project: {
    type: Schema.Types.ObjectId,
    ref: 'project',
    index: true,
  },
  remote: {
    type: Map,
    of: String,
    set: function (value: Record<'name' | 'title' | '_id', string>) {
      return value || null;
    },
  },
  plan: {
    type: String,
    enum: Object.values(PROJECT_PLAN_TYPES),
    default: PROJECT_PLAN_TYPES.commercial,
    index: true,
  },
  billing: {
    type: Schema.Types.Mixed,
  },
  steps: {
    type: [String],
  },
  config: {
    type: Schema.Types.Mixed,
  },
  framework: {
    type: String,
    enum: [
      'angular',
      'angular2',
      'react',
      'vue',
      'html5',
      'simple',
      'custom',
      'aurelia',
      'javascript',
    ],
    description: 'The target framework for the project.',
    default: 'angular',
    maxlength: 32,
  },
  protect: {
    type: Boolean,
    default: false,
  },
  primary: {
    type: Boolean,
    default: false,
  },
  deleted: {
    type: Number,
    default: null,
  },
  access: [
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
  ],
  trial: {
    type: Date,
    default: Date.now,
    __readonly: true,
  },
  lastDeploy: {
    type: Date,
    __readonly: true,
  },
  formDefaults: {
    type: Schema.Types.Mixed,
    default: null,
  },
  stageTitle: {
    type: String,
    maxlength: 63,
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
ProjectSchema.set('minimize', false);
ProjectSchema.pre('save', function (next: () => void) {
  // TODO Figure out how to attach `this` properly
  // eslint-disable-next-line
  // @ts-ignore
  this.modified = new Date();
  next();
});
