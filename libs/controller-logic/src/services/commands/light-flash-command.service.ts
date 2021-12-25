import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@text-based/utilities';
import { each } from 'async';

import { RountineCommandLightFlashDTO } from '../../contracts';
import { GroupService } from '../groups';
import { FlashAnimationService } from '../lighting';

@Injectable()
export class LightFlashCommandService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly flashAnimation: FlashAnimationService,
    private readonly groupService: GroupService,
  ) {}

  public async activate(command: RountineCommandLightFlashDTO): Promise<void> {
    await process.nextTick(async () => {
      if (command.type === 'group') {
        return await this.activateGroup(command);
      }
      return await this.activateEntity(command);
    });
  }

  private async activateEntity({
    ref,
    brightness,
    duration,
    interval,
    rgb,
  }: RountineCommandLightFlashDTO): Promise<void> {
    this.logger.debug(`Flash entity ${ref}`);
    await this.flashAnimation.flash({
      brightness,
      duration,
      entity_id: ref,
      interval,
      rgb_color: rgb,
    });
  }

  private async activateGroup({
    ref,
    brightness,
    duration,
    rgb,
    interval,
  }: RountineCommandLightFlashDTO): Promise<void> {
    const group = await this.groupService.get(ref);
    this.logger.debug(`Flash entity ${group.friendlyName}`);
    await each(group.entities, async (entity, callback) => {
      await this.flashAnimation.flash({
        brightness,
        duration,
        entity_id: entity,
        interval,
        rgb_color: rgb,
      });
      if (callback) {
        callback();
      }
    });
  }
}
