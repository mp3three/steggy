import { AutoLogService, PEAT } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { FlashAnimationDTO, LightingCacheDTO } from '../../contracts';
import { CircadianService } from './circadian.service';
import { LightManagerService } from './light-manager.service';

const MAX_AUTO = 500;
const HALF = 2;
const OFF = 0;

@Injectable()
export class AnimationService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly lightManager: LightManagerService,
    private readonly circadianService: CircadianService,
  ) {}

  public async flash(
    animation: FlashAnimationDTO,
    current: LightingCacheDTO,
  ): Promise<void> {
    const interval = Math.floor(
      (animation.interval ?? animation.duration > MAX_AUTO
        ? MAX_AUTO
        : animation.duration) / HALF,
    );
    current.brightness ??= OFF;
    animation.brightness ??= current.brightness;
    const brightnessDelta =
      (current.brightness - animation.brightness) / interval;
    let currentBrightness = current.brightness;
    const startLeg = PEAT(interval).map(() => {
      currentBrightness += brightnessDelta;
      return {
        brightness: Math.floor(currentBrightness),
      } as LightingCacheDTO;
    });
  }
}
