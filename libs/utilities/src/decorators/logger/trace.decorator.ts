import { TRACE_LOG, TraceLogDTO } from '@automagical/contracts/utilities';
import { SetMetadata } from '@nestjs/common';

export function Trace(message?: string | TraceLogDTO): MethodDecorator {
  return SetMetadata(
    TRACE_LOG,
    typeof message === 'string' ? { message } : message ?? {},
  );
}
