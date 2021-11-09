import {
  GENERIC_COMMANDS,
  GroupDTO,
  LightingCacheDTO,
  RoomEntitySaveStateDTO,
  RoutineCommandGroupActionDTO,
} from '@automagical/controller-logic';
import { ICONS, PromptEntry, PromptService } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';

import { HomeFetchService } from '../home-fetch.service';

const MIN_BRIGHTNESS = 5;
const MAX_BRIGHTNESS = 255;

const GENERIC_COMMANDS: PromptEntry<GENERIC_COMMANDS>[] = [
  [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
  [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
  [`${ICONS.CIRCADIAN}Circadian On`, 'circadianOn'],
  [`${ICONS.UP}Dim Up`, 'dimUp'],
  [`${ICONS.DOWN}Dim Down`, 'dimDown'],
  [`${ICONS.BRIGHTNESS}Set Brightness`, 'brightness'],
];

@Injectable()
export class LightGroupCommandService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async circadianOn(group: GroupDTO | string): Promise<void> {
    group = typeof group === 'string' ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/circadianOn`,
    });
  }

  public async commandBuilder(
    current?: string,
    extra?: LightingCacheDTO,
  ): Promise<Omit<RoutineCommandGroupActionDTO, 'group'>> {
    const command = await this.promptService.pickOne(
      `Light group action`,
      [
        [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
        [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
        [`${ICONS.UP}Dim Up`, `dimUp`],
        [`${ICONS.DOWN}Dim Down`, `dimDown`],
        [`${ICONS.BRIGHTNESS}Set Brightness`, `setBrightness`],
        [`${ICONS.CIRCADIAN}Circadian`, `circadianOn`],
      ],
      current,
    );
    switch (command) {
      case 'turnOn':
      case 'circadianOn':
        if (!(await this.promptService.confirm(`Set brightness?`))) {
          return { command };
        }
      // fall through
      case 'setBrightness':
        return {
          command,
          extra: {
            brightness: await this.promptService.number(
              `Set brightness (1-255)`,
              extra?.brightness,
            ),
          },
        };
      case 'dimDown':
      case 'dimUp':
        return {
          command,
          extra: {
            brightness: await this.promptService.number(
              `Change amount (1-255)`,
              extra?.brightness,
            ),
          },
        };
    }

    throw new NotImplementedException();
  }

  public async dimDown(group: GroupDTO | string): Promise<void> {
    group = typeof group === 'string' ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/dimDown`,
    });
  }

  public async dimUp(group: GroupDTO | string): Promise<void> {
    group = typeof group === 'string' ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/dimUp`,
    });
  }

  public async groupActions(): Promise<PromptEntry[]> {
    return await [
      [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
      [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
      [`${ICONS.UP}Dim Up`, `dimUp`],
      [`${ICONS.DOWN}Dim Down`, `dimDown`],
      [`${ICONS.CIRCADIAN}Circadian`, `circadianOn`],
    ];
  }

  public async processAction(group: GroupDTO, action: string): Promise<void> {
    switch (action) {
      case 'dimUp':
        return await this.dimUp(group);
      case 'dimDown':
        return await this.dimDown(group);
      case 'turnOn':
        return await this.turnOn(group);
      case 'turnOff':
        return await this.turnOff(group);
      case 'circadianOn':
        return await this.circadianOn(group);
    }
    if (action === 'brightness') {
      group = await this.refresh(group);
      await this.promptChangeBrightness(group);
      return;
    }
    this.logger.error({ action }, `Unknown action`);
  }

  public async promptChangeBrightness(group: GroupDTO): Promise<void> {
    let current = 0;
    const onList = group.state.states.filter(
      (item) => item.state === 'on',
    ) as RoomEntitySaveStateDTO<LightingCacheDTO>[];
    onList.forEach((item) => {
      current += item.extra.brightness;
    });
    current = Math.floor(current / onList.length);
    const brightness = await this.promptService.number(
      `Brightness target (${MIN_BRIGHTNESS}-${MAX_BRIGHTNESS})`,
      current,
    );
    if (brightness > MAX_BRIGHTNESS || brightness < MIN_BRIGHTNESS) {
      this.logger.error(
        { brightness },
        `Out of range ${MIN_BRIGHTNESS}-${MAX_BRIGHTNESS}`,
      );
    }
    return await this.setBrightness(group, brightness);
  }

  public async refresh(group: GroupDTO | string): Promise<GroupDTO> {
    if (typeof group === 'string') {
      return await this.fetchService.fetch({
        url: `/group/${group}`,
      });
    }
    return await this.fetchService.fetch({
      url: `/group/${group._id}`,
    });
  }

  public async setBrightness(
    group: GroupDTO,
    brightness: number,
  ): Promise<void> {
    await this.fetchService.fetch({
      body: {
        brightness,
      },
      method: 'put',
      url: `/group/${group._id}/expand`,
    });
  }

  public async turnOff(group: GroupDTO | string): Promise<void> {
    group = typeof group === 'string' ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/turnOff`,
    });
  }

  public async turnOn(group: GroupDTO | string): Promise<void> {
    group = typeof group === 'string' ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/turnOn`,
    });
  }
}
