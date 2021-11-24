import { ApiResponse } from '@nestjs/swagger';

/**
 * Got nothing better to respond with?
 */
export const GENERIC_SUCCESS_RESPONSE = { success: true };
export function ApiGenericResponse(): MethodDecorator {
  return ApiResponse({
    schema: {
      properties: {
        success: {
          type: 'boolean',
        },
      },
      type: 'object',
    },
  });
}
