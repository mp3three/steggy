import { ResponseLocals } from '@formio/contracts';
import { SERVER_METADATA } from '@formio/contracts/server';
import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';

import { EmitAfterInterceptor } from '../interceptors/emit-after.interceptor';

/**
 * Emit an internal server event after the route completes.
 *
 * By default, will attach the return result of the route with the emit. Optionally can use a local from the request
 */
export function EmitEventAfter(
  event: string,
  local?: keyof ResponseLocals,
): MethodDecorator {
  const decorators: MethodDecorator[] = [
    UseInterceptors(EmitAfterInterceptor),
    SetMetadata(SERVER_METADATA.EMIT_AFTER, event),
  ];
  if (local) {
    decorators.push(SetMetadata(SERVER_METADATA.RES_LOCAL_KEY, local));
  }
  return applyDecorators(...decorators);
}
