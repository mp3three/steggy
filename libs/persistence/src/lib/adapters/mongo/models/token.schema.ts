import * as faker from 'faker';
import { Schema } from 'mongoose';

export const TokenDefinition = {
  key: {
    type: String,
    required: true,
    default: (): string => faker.random.alphaNumeric(30),
  },
  value: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
  },
};
export const TokenSchema = new Schema(TokenDefinition);
