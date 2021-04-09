import { FormType } from '@automagical/contracts/formio-sdk';
import { Schema } from 'mongoose';
import { deleted, name, owner, permission, title } from './common.schema';
import { FieldMatchAccessPermissionDefinition } from './FieldMatchAccessPermission.schema';
const INVALID_REGEX = /[^0-9a-zA-Z\-/]|^-|-$|^\/|\/$/;

const uniqueMessage =
  'may only contain letters, numbers, hyphens, and forward slashes ' +
  '(but cannot start or end with a hyphen or forward slash)';

export const FormDefinition = {
  title,
  name,
  deleted,
  access: permission,
  path: {
    type: String,
    index: true,
    required: true,
    lowercase: true,
    trim: true,
    validate: [
      {
        message: `The path ${uniqueMessage}`,
        validator: (value: string): boolean => !INVALID_REGEX.test(value),
      },
      {
        message: 'Path cannot end in `submission` or `action`',
        validator: (path: string): boolean =>
          !path.match(/(submission|action)\/?$/),
      },
    ],
  },
  type: {
    type: String,
    enum: Object.values(FormType),
    required: true,
    default: FormType.form,
    index: true,
  },
  display: {
    type: String,
  },
  action: {
    type: String,
  },
  tags: {
    type: [String],
    index: true,
  },
  submissionAccess: permission,
  fieldMatchAccess: {
    type: {
      read: [FieldMatchAccessPermissionDefinition],
      write: [FieldMatchAccessPermissionDefinition],
      create: [FieldMatchAccessPermissionDefinition],
      admin: [FieldMatchAccessPermissionDefinition],
    },
  },
  owner,
  components: {
    type: [Schema.Types.Mixed],
  },
  settings: {
    type: Schema.Types.Mixed,
  },
  properties: {
    type: Schema.Types.Mixed,
  },
};
export const FormSchema = new Schema(FormDefinition);
