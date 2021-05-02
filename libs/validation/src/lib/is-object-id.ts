import { registerDecorator, ValidationOptions } from 'class-validator';
import { Types } from 'mongoose';
import { ObjectId } from 'bson';

export function IsObjectId(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: Record<string, string>, propertyName: string) => {
    registerDecorator({
      name: 'isObjectId',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return Types.ObjectId.isValid(value);
        },
      },
    });
  };
}
// FIXME: This doens't seem to generate using the same format as mongo as expected
IsObjectId.fake = () => {
  return new ObjectId().toHexString();
};
