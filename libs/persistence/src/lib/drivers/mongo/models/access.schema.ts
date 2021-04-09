import { ACCESS_TYPES } from '@automagical/contracts/formio-sdk';
import { Schema, Types } from 'mongoose';

export const AccessDefinition = {
  type: {
    type: String,
    enum: ACCESS_TYPES,
    required:
      'A permission type is required to associate an available permission with a Resource.',
  },
  resources: {
    type: [Schema.Types.Mixed],
    ref: 'form',
    set(resources: string[]): Types.ObjectId[] {
      // Attempt to convert to objectId.
      return resources.map(Types.ObjectId);
    },
    get(resources: unknown[]): unknown[] {
      return Array.isArray(resources)
        ? resources.map((resource) => resource.toString())
        : resources;
    },
  },
};
export const AccessSchema = new Schema(AccessDefinition);
