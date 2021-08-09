import { WARNING_LOG, WarningLogDTO } from '@automagical/contracts/utilities';
import { SetMetadata } from '@nestjs/common';

export function Warn(message?: string | WarningLogDTO): MethodDecorator {
  return SetMetadata(
    WARNING_LOG,
    typeof message === 'string' ? { message } : message ?? {},
  );
}
