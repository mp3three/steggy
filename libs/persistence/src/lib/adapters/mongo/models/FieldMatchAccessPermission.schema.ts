import { Schema } from 'mongoose';

export const FieldMatchAccessPermissionDefinition = {
  formFieldPath: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  operator: {
    type: String,
    enum: ['$eq', '$lt', '$gt', '$lte', '$gte', '$in'],
    default: '$eq',
  },
  valueType: {
    type: String,
    enum: ['string', 'number', 'boolean', '[string]', '[number]'],
    required: true,
    default: 'string',
    validate: [
      {
        validator: function (type: string): boolean {
          switch (type) {
            case 'number':
              return isFinite(Number(this.value));
            case 'boolean':
              return this.value === 'true' || this.value === 'false';
            case '[number]':
              return this.value
                .replace(/(^,)|(,$)/g, '')
                .split(',')
                .map((val) => Number(val))
                .every((val) => isFinite(val));
          }
        },
        message: 'Value does not match a selected type',
      },
    ],
  },
  roles: {
    type: [Schema.Types.ObjectId],
    ref: 'role',
  },
};
export const FieldMatchAccessPermissionSchema = new Schema(
  FieldMatchAccessPermissionDefinition,
);

FieldMatchAccessPermissionSchema.set('minimize', false);
FieldMatchAccessPermissionSchema.pre('save', function (next: () => void) {
  // TODO Figure out how to attach `this` properly
  // eslint-disable-next-line
  // @ts-ignore
  this.modified = new Date();
  next();
});
