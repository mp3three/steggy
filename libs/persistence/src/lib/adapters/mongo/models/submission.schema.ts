import { Schema, Types } from 'mongoose';
import { AccessDefinition } from './access.schema';
import { deleted, form, owner } from './common.schema';

const ExternalIdSchema = new Schema({
  type: String,
  resource: String,
  id: String,
});
export const SubmissionDefinition = {
  form,
  owner,
  deleted,

  // The roles associated with this submission, if any.
  // Useful for complex custom resources.
  roles: {
    type: [Schema.Types.Mixed],
    ref: 'role',
    index: true,
    set(roles: string[]): Types.ObjectId[] {
      // Attempt to convert to objectId.
      return roles.map(Types.ObjectId);
    },
    get(roles: string[] | Types.ObjectId[]): string[] {
      return Array.isArray(roles)
        ? roles.map((role) => role.toString())
        : roles;
    },
  },

  // The access associated with this submission.
  // Useful for complex custom permissions.
  access: {
    type: [AccessDefinition],
    index: true,
  },

  externalIds: [ExternalIdSchema],

  // Configurable meta data associated with a submission.
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },

  // The data associated with this submission.
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
};
export const SubmissionSchema = new Schema(SubmissionDefinition);
