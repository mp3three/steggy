import { ClassConstructor, plainToInstance } from 'class-transformer';

/**
 * Force the return result of the annotated function into the indicated type
 * If return result is an array, map all items to type
 *
 * Primarily used for forcing object ids to strings
 */
export function CastResult(
  dto: ClassConstructor<unknown>,
  { record }: { record?: boolean } = {},
): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const original = descriptor.value;
    descriptor.value = async function (...parameters) {
      const result = await Reflect.apply(original, this, parameters);
      if (record) {
        return Object.fromEntries(
          Object.entries(result).map(([key, value]) => [
            key,
            plainToInstance(dto, value),
          ]),
        );
      }
      if (Array.isArray(result)) {
        return result.map((item) => {
          if (item._id) {
            item._id = item._id.toString();
          }
          return plainToInstance(dto, item);
        });
      }
      if (result._id) {
        result._id = result._id.toString();
      }
      return plainToInstance(dto, result);
    };
    return descriptor;
  };
}
