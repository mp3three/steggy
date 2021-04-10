import {
  PROJECT_FRAMEWORKS,
  PROJECT_PLAN_TYPES,
  PROJECT_TYPES,
} from '@automagical/contracts/formio-sdk';
import { Schema } from 'mongoose';
import {
  CreateSchema,
  deleted,
  name,
  owner,
  permission,
  project,
  title,
} from './common.schema';

export const ProjectDefinition = {
  owner,
  name,
  access: permission,
  project,

  title,
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
  remote: {
    type: Map,
    of: String,
    set: function (
      value: Record<'name' | 'title' | '_id', string>,
    ): Record<'name' | 'title' | '_id', string> {
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
    enum: Object.values(PROJECT_FRAMEWORKS),
    default: PROJECT_FRAMEWORKS.angular,
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
  deleted,
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
};
export const ProjectSchema = CreateSchema(ProjectDefinition);
