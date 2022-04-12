import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { RoutineCommandLightFlashDTO } from '@steggy/controller-shared';
import { each } from '@steggy/utilities';

import { GroupService } from '../groups';
import { FlashAnimationService } from '../lighting';

@Injectable()
export class LightFlashCommandService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly flashAnimation: FlashAnimationService,
    private readonly groupService: GroupService,
  ) {}

  public async activate(
    command: RoutineCommandLightFlashDTO,
    waitForChange = false,
  ): Promise<void> {
    await process.nextTick(async () => {
      if (command.type === 'group') {
        return await this.activateGroup(command, waitForChange);
      }
      return await this.activateEntity(command, waitForChange);
    });
  }

  private async activateEntity(
    { ref, brightness, duration, interval, rgb }: RoutineCommandLightFlashDTO,

    waitForChange = false,
  ): Promise<void> {
    this.logger.debug(`Flash entity ${ref}`);
    await this.flashAnimation.flash(
      {
        brightness,
        duration,
        entity_id: ref,
        interval,
        rgb_color: rgb,
      },
      waitForChange,
    );
  }

  private async activateGroup(
    { ref, brightness, duration, rgb, interval }: RoutineCommandLightFlashDTO,

    waitForChange = false,
  ): Promise<void> {
    const group = await this.groupService.get(ref);
    this.logger.debug(`Flash entity ${group.friendlyName}`);
    await each(group.entities, async entity => {
      await this.flashAnimation.flash(
        {
          brightness,
          duration,
          entity_id: entity,
          interval,
          rgb_color: rgb,
        },
        waitForChange,
      );
    });
  }
}
