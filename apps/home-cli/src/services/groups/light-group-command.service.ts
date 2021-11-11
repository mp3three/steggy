import {
  GENERIC_COMMANDS,
  GroupDTO,
  LightingCacheDTO,
  RoomEntitySaveStateDTO,
  RoutineCommandGroupActionDTO,
} from '@automagical/controller-logic';
import { domain, LightStateDTO } from '@automagical/home-assistant';
import {
  ColorsService,
  ICONS,
  PromptEntry,
  PromptService,
} from '@automagical/tty';
import { AutoLogService, TitleCase } from '@automagical/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { each } from 'async';
import chalk from 'chalk';
import { LightService } from '../domains';
import { EntityService } from '../entity.service';

import { HomeFetchService } from '../home-fetch.service';

const MIN_BRIGHTNESS = 5;
const MAX_BRIGHTNESS = 255;

const UP = 1;
const DOWN = -1;
const R_MULTIPLIER = 0.299;
const G_MULTIPLIER = 0.587;
const B_MULTIPLIER = 0.114;
const THRESHOLD = 127.5;

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
    private readonly entityCommand: EntityService,
    private readonly fetchService: HomeFetchService,
    private readonly lightDomain: LightService,
    private readonly colorService: ColorsService,
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
            brightness: await this.promptService.brightness(
              extra?.brightness,
              `Set brightness`,
            ),
          },
        };
      case 'dimDown':
      case 'dimUp':
        return {
          command,
          extra: {
            brightness: await this.promptService.brightness(
              extra?.brightness,
              `Change amount`,
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
      [`${ICONS.BRIGHTNESS}Set Brightness`, `setBrightness`],
      [`${ICONS.UP}Dim Up`, `dimUp`],
      [`${ICONS.DOWN}Dim Down`, `dimDown`],
      [`${ICONS.CIRCADIAN}Circadian`, `circadianOn`],
    ];
  }

  public async header(group: GroupDTO): Promise<void> {
    this.promptService.scriptHeader(`Group`);
    console.log(
      [
        chalk.magenta.bold`${group.friendlyName}`,
        chalk.yellow.bold`${TitleCase(group.type)} Group`,
      ].join(chalk.cyan(' - ')),
      `\n\n`,
    );
    let maxId = 0;
    let maxName = 0;
    const lines: string[][] = [];
    // TODO: Refactor into 1 request, instead of n
    await each(group.entities, async (id) => {
      const content = await this.lightDomain.getState<LightStateDTO>(id);
      const parts: string[] = [content.attributes.friendly_name, id];
      maxId = Math.max(maxId, id.length);
      maxName = Math.max(maxName, content.attributes.friendly_name.length);
      if (content.state === 'on') {
        const [r, g, b] = content.attributes.rgb_color;
        const message = `     ${TitleCase(content.state)}     `;
        const isBright =
          Math.sqrt(
            R_MULTIPLIER * (r * r) +
              G_MULTIPLIER * (g * g) +
              B_MULTIPLIER * (b * b),
          ) > THRESHOLD;
        parts.push(
          chalk[isBright ? 'black' : 'whiteBright'].bgRgb(r, g, b)(message),
        );
      } else {
        parts.push(chalk.bgGray.whiteBright`     Off     `);
      }
      lines.push(parts);
    });
    lines
      // , , , ,
      .sort(([, a], [, b]) => (a > b ? UP : DOWN))
      .forEach((line) =>
        console.log(
          chalk` {cyan -} ${line
            .shift()
            .padEnd(maxName, ' ')} {yellow.bold ${line
            .shift()
            .padEnd(maxId, ' ')}} ${line.shift()}`,
        ),
      );
    console.log();
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
      case 'setBrightness':
        group = await this.refresh(group);
        return await this.promptChangeBrightness(group);
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

  private async headerColors(group: GroupDTO): Promise<string[]> {
    // const entities = await
    return [];
  }
}
