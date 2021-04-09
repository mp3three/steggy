import { AccessTypes } from '@automagical/contracts/formio-sdk';
import { Schema } from 'mongoose';

export const PermissionDefinition = {
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
};
export const PermissionSchema = new Schema(PermissionDefinition);
