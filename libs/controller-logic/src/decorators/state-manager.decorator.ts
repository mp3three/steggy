import { STATE_MANAGER } from '@automagical/contracts/controller-logic';
import { SetMetadata } from '@nestjs/common';

export function StateManager(): PropertyDecorator {
  return SetMetadata(STATE_MANAGER, true);
}
