import { AccessTypes, FormType } from '@automagical/contracts/formio-sdk';
import { Schema, Types } from 'mongoose';
import { FieldMatchAccessPermissionDefinition } from './FieldMatchAccessPermission.schema';
const INVALID_REGEX = /[^0-9a-zA-Z\-/]|^-|-$|^\/|\/$/;

const PermissionSchema = [
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

const uniqueMessage =
  'may only contain letters, numbers, hyphens, and forward slashes ' +
  '(but cannot start or end with a hyphen or forward slash)';
export const foo = new Schema({
  title: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    validate: [
      {
        message: `The name ${uniqueMessage}`,
        validator: (value) => INVALID_REGEX.test(value),
      },
    ],
  },
  path: {
    type: String,
    index: true,
    required: true,
    lowercase: true,
    trim: true,
    validate: [
      {
        message: `The path ${uniqueMessage}`,
        validator: (value) => !INVALID_REGEX.test(value),
      },
      {
        message: 'Path cannot end in `submission` or `action`',
        validator: (path) => !path.match(/(submission|action)\/?$/),
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
  deleted: {
    type: Number,
    default: null,
  },
  access: [PermissionSchema],
  submissionAccess: [PermissionSchema],
  fieldMatchAccess: {
    type: {
      read: [FieldMatchAccessPermissionDefinition],
      write: [FieldMatchAccessPermissionDefinition],
      create: [FieldMatchAccessPermissionDefinition],
      admin: [FieldMatchAccessPermissionDefinition],
    },
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
  components: {
    type: [Schema.Types.Mixed],
  },
  settings: {
    type: Schema.Types.Mixed,
  },
  properties: {
    type: Schema.Types.Mixed,
  },
});
