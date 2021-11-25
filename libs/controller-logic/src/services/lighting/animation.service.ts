import { EntityManagerService, LightStateDTO } from '@ccontour/home-assistant';
import { AutoLogService, PEAT, sleep } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';
import { eachSeries } from 'async';

import { FlashAnimationDTO, LightingCacheDTO } from '../../contracts';
import { CircadianService } from './circadian.service';
import { LightManagerService } from './light-manager.service';

const HALF = 2;
const OFF = 0;
const START = 0;

@Injectable()
export class AnimationService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly lightManager: LightManagerService,
    private readonly entityManager: EntityManagerService,
    private readonly circadianService: CircadianService,
  ) {}

  public async flash(animation: FlashAnimationDTO): Promise<void> {
    const steps = Math.floor(animation.duration / animation.interval);
    const frames = PEAT(steps).map(() => ({})) as LightingCacheDTO[];
    const reverse = frames.length / HALF;

    if (typeof animation.brightness !== 'undefined') {
      const entity = this.entityManager.getEntity<LightStateDTO>(
        animation.entity_id,
      );
      let current = entity?.attributes?.brightness ?? OFF;
      const distance = animation.brightness - current;
      const delta = reverse / distance;
      frames
        .slice(START, distance)
        .forEach((i) => (i.brightness = current = current + delta));
      current = animation.brightness;
      frames
        .slice(distance)
        .forEach((i) => (i.brightness = current = current - delta));
    }

    await eachSeries(frames, async (state, callback) => {
      await this.lightManager.turnOn(animation.entity_id, state);
      await sleep(animation.interval);
      if (callback) {
        callback();
      }
    });
  }
}
