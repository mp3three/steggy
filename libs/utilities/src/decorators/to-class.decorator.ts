import { ClassConstructor, plainToClass } from 'class-transformer';

/**
 * Force the return result of the annotated function into the indicated type
 * If return result is an array, map all items to type
 *
 * Primarily used for forcing object ids to strings
 */
export function ToClass(dto: ClassConstructor<unknown>): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...parameters) {
      const result = await originalMethod.apply(this, parameters);
      if (Array.isArray(result)) {
        return result.map((item) => {
          item._id = item._id.toString();
          return plainToClass(dto, item);
        });
      }
      result._id = result._id.toString();
      return plainToClass(dto, result);
    };
    return descriptor;
  };
}
