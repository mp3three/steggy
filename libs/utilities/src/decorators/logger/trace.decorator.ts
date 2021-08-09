import { TRACE_LOG, TraceLogDTO } from '@automagical/contracts/utilities';
import { SetMetadata } from '@nestjs/common';

/**
 * NOTE: Currently does not place nice with `@Cron`
 */
export function Trace(message?: string | TraceLogDTO): MethodDecorator {
  return SetMetadata(
    TRACE_LOG,
    typeof message === 'string' ? { message } : message ?? {},
  );
}
