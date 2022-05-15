import { Transform } from 'class-transformer';
import type { Types } from 'mongoose';

import { applyDecorators } from '../apply-decorators';
import { is } from '../is';

/**
 * Assistance for class-transformer to properly cast ObjectIds
 *
 * Is safe to apply for (string | Types.ObjectId | undefined) types
 */
export function TransformObjectId(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) => {
      if (value && is.object(value)) {
        return (value as Types.ObjectId).toHexString();
      }
      return value;
    }),
  );
}
