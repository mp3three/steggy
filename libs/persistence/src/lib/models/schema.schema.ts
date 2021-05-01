import { Schema } from 'mongoose';

export const SchemaDefinition = {
  key: {
    type: String,
    required: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  version: {
    type: String,
    default: null,
  },
  value: {
    type: String,
    default: null,
  },
};

// I heard you wanted some schema with your schema
export const SchemaSchema = new Schema(SchemaDefinition);
