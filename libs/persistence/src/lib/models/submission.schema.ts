import { Schema, Types } from 'mongoose';
import { AccessSchema } from './access.schema';
import { CreateSchema, deleted, form, owner } from './common.schema';

const ExternalIdSchema = CreateSchema({
  type: String,
  resource: String,
  id: String,
});
export const SubmissionDefinition = {
  form,
  owner,
  deleted,

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

  access: {
    type: [AccessSchema],
    index: true,
  },

  externalIds: [ExternalIdSchema],

  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },

  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
};
export const SubmissionSchema = CreateSchema(SubmissionDefinition, {
  minimize: true,
});

SubmissionSchema.index({
  project: 1,
  deleted: 1,
})
  .index({
    project: 1,
    form: 1,
    deleted: 1,
  })
  .index({
    project: 1,
    form: 1,
    deleted: 1,
    created: -1,
  })
  .index(
    {
      deleted: 1,
    },
    {
      partialFilterExpression: { deleted: { $eq: null } },
    },
  )
  .index({
    form: 1,
    deleted: 1,
    created: -1,
  });
