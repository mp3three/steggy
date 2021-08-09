import { DEBUG_LOG, DebugLogDTO } from '@automagical/contracts/utilities';
import { SetMetadata } from '@nestjs/common';

export function Debug(message?: string | DebugLogDTO): MethodDecorator {
  return SetMetadata(
    DEBUG_LOG,
    typeof message === 'string' ? { message } : message ?? {},
  );
}
