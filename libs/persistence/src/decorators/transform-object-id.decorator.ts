import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

/**
 * Assistance for class-transformer to properly cast ObjectIds
 *
 * Is safe to apply for (string | Types.ObjectId | undefined) types
 */
export function TransformObjectId(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) => {
      if (value && typeof value === 'object') {
        return (value as Types.ObjectId).toHexString();
      }
      return value;
    }),
  );
}
