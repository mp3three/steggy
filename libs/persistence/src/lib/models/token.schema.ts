import faker from 'faker';
import { CreateSchema } from './common.schema';

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
export const TokenSchema = CreateSchema(TokenDefinition, { minimize: true });
TokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
