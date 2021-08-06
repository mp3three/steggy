import { LIGHTING_CONTROLLER } from '@automagical/contracts/controller-logic';
import { SetMetadata } from '@nestjs/common';

export function LightingController(): PropertyDecorator {
  return SetMetadata(LIGHTING_CONTROLLER, true);
}
