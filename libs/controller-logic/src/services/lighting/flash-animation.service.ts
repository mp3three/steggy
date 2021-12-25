import {
  EntityManagerService,
  LightStateDTO,
} from '@text-based/home-assistant';
import { AutoLogService, is, PEAT, sleep } from '@text-based/utilities';
import { Injectable } from '@nestjs/common';
import { eachSeries } from 'async';

import {
  FlashAnimationDTO,
  LIGHTING_MODE,
  LightingCacheDTO,
} from '../../contracts';
import { LightManagerService } from './light-manager.service';

const HALF = 2;
const OFF = 0;
const START = 0;

@Injectable()
export class FlashAnimationService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly lightManager: LightManagerService,
    private readonly entityManager: EntityManagerService,
  ) {}

  public async flash(animation: FlashAnimationDTO): Promise<void> {
    this.logger.info({ animation }, `Flash animation`);
    const steps = Math.floor(animation.duration / animation.interval);
    const frames = PEAT(steps).map(() => ({})) as LightingCacheDTO[];
    const entity = this.entityManager.getEntity<LightStateDTO>(
      animation.entity_id,
    );
    const { mode } =
      (await this.lightManager.getState(animation.entity_id)) || {};

    if (!is.string(animation)) {
      this.brightnessFlash(entity, animation, frames);
    }
    if (!is.string(animation.rgb_color)) {
      this.colorFlash(entity, animation, frames);
    }
    await eachSeries(frames, async (state, callback) => {
      this.logger.debug({ state }, animation.entity_id);
      // Merge together timeouts
      // Doing them consectively will throw off total timing
      await Promise.all([
        await this.lightManager.turnOn(animation.entity_id, state),
        await sleep(animation.interval),
      ]);
      if (callback) {
        callback();
      }
    });
    if (mode === LIGHTING_MODE.circadian) {
      this.logger.debug(`Restoring circadian state {${animation.entity_id}}`);
      await this.lightManager.circadianLight(animation.entity_id);
    }
  }

  private brightnessFlash(
    entity: LightStateDTO,
    animation: FlashAnimationDTO,
    frames: LightingCacheDTO[],
  ): void {
    const reverse = frames.length / HALF;
    let current = entity?.attributes?.brightness ?? OFF;
    const distance = animation.brightness - current;
    const delta = distance / reverse;
    frames.slice(START, reverse).forEach((i) => {
      current = current + delta;
      i.brightness = Math.floor(current);
    });
    current = animation.brightness;
    frames.slice(reverse).forEach((i) => {
      current = current - delta;
      i.brightness = Math.floor(current);
    });
  }

  private colorFlash(
    entity: LightStateDTO,
    animation: FlashAnimationDTO,
    frames: LightingCacheDTO[],
  ): void {
    const reverse = frames.length / HALF;
    const { r: targetR, g: targetG, b: targetB } = animation.rgb_color;
    let [r, g, b] = entity.attributes?.rgb_color ?? [OFF, OFF, OFF];
    const bDistance = targetB - b;
    const gDistance = targetG - g;
    const rDistance = targetR - r;

    const bDelta = bDistance / reverse;
    const gDelta = gDistance / reverse;
    const rDelta = rDistance / reverse;
    frames.slice(START, reverse).forEach((i) => {
      b = b + bDelta;
      g = g + gDelta;
      r = r + rDelta;
      i.rgb_color = [this.round(r), this.round(g), this.round(b)];
    });
    r = targetR;
    g = targetG;
    b = targetB;
    frames.slice(reverse).forEach((i) => {
      b = b - bDelta;
      g = g - gDelta;
      r = r - rDelta;
      i.rgb_color = [this.round(r), this.round(g), this.round(b)];
    });
  }

  private round(item: number): number {
    item = Math.floor(item);
    if (item < OFF) {
      return OFF;
    }
    return item;
  }
}
