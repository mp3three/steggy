import { ApiParam } from '@nestjs/swagger';

/**
 * Listing of keys used to apply metadata to routes with
 */
export enum SERVER_METADATA {
  EMIT_AFTER = 'EMIT_AFTER',
  RES_LOCAL_KEY = 'RES_LOCAL_KEY',
}

export const SwaggerParameters = (...parameters: string[]): MethodDecorator => {
  return (...decoratorArguments) => {
    parameters.forEach((name) => {
      return ApiParam({
        name,
        required: true,
      })(...decoratorArguments);
    });
  };
};
