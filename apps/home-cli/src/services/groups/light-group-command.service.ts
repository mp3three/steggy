import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  GeneralSaveStateDTO,
  GroupDTO,
  RoutineCommandGroupActionDTO,
} from '@steggy/controller-shared';
import {
  LightAttributesDTO,
  LightStateDTO,
} from '@steggy/home-assistant-shared';
import {
  ApplicationManagerService,
  ColorsService,
  ICONS,
  KeyMap,
  PromptEntry,
  PromptService,
  RGB,
  ScreenService,
  SyncLoggerService,
  ToMenuEntry,
} from '@steggy/tty';
import { DOWN, is, START, TitleCase, UP } from '@steggy/utilities';
import { each } from 'async';
import chalk from 'chalk';

import { LightService } from '../domains';
import { HomeFetchService } from '../home-fetch.service';

const MIN_BRIGHTNESS = 5;
const MAX_BRIGHTNESS = 255;
const OFF = 0;
const R = 0;
const SINGLE = 1;
const G = 1;
const B = 2;

const R_MULTIPLIER = 0.299;
const G_MULTIPLIER = 0.587;
const B_MULTIPLIER = 0.114;
const THRESHOLD = 127.5;

// const GENERIC_COMMANDS: PromptEntry<string>[] = [
//   [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
//   [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
//   [`${ICONS.CIRCADIAN}Circadian On`, 'circadianOn'],
//   [`${ICONS.UP}Dim Up`, 'dimUp'],
//   [`${ICONS.DOWN}Dim Down`, 'dimDown'],
//   [`${ICONS.BRIGHTNESS}Set Brightness`, 'brightness'],
// ];

@Injectable()
export class LightGroupCommandService {
  constructor(
    private readonly logger: SyncLoggerService,
    private readonly promptService: PromptService,
    private readonly applicationManager: ApplicationManagerService,
    private readonly screenService: ScreenService,
    private readonly fetchService: HomeFetchService,
    private readonly lightDomain: LightService,
    private readonly colorService: ColorsService,
  ) {}

  public keyMap: KeyMap = {
    '[': [`${ICONS.UP}Dim Up`, 'dimUp'],
    ']': [`${ICONS.DOWN}Dim Down`, 'dimDown'],
    b: [`${ICONS.BRIGHTNESS}Set Brightness`, `setBrightness`],
    c: [`${ICONS.CIRCADIAN}Circadian`, `circadianOn`],
    e: [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
    f: [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
  };

  public async circadianOn(group: GroupDTO | string): Promise<void> {
    group = is.string(group) ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/circadianOn`,
    });
  }

  public async commandBuilder(
    current?: string,
    extra?: LightAttributesDTO,
  ): Promise<Omit<RoutineCommandGroupActionDTO, 'group'>> {
    const command = await this.promptService.pickOne(
      `Light group action`,
      ToMenuEntry([
        [`${ICONS.TURN_ON}Turn On`, 'turnOn'],
        [`${ICONS.TURN_OFF}Turn Off`, 'turnOff'],
        [`${ICONS.UP}Dim Up`, `dimUp`],
        [`${ICONS.DOWN}Dim Down`, `dimDown`],
        [`${ICONS.BRIGHTNESS}Set Brightness`, `setBrightness`],
        [`${ICONS.CIRCADIAN}Circadian`, `circadianOn`],
        [`${ICONS.COLOR}Set Color`, 'color'],
      ]),
      current,
    );
    switch (command) {
      case 'color':
        const { r, g, b } = await this.colorService.buildRGB();
        return {
          command,
          extra: {
            rgb_color: [r, g, b],
          },
        };
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
    group = is.string(group) ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/dimDown`,
    });
  }

  public async dimUp(group: GroupDTO | string): Promise<void> {
    group = is.string(group) ? group : group._id;
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
      [`${ICONS.COLOR}Set Color`, 'color'],
      [`${ICONS.CIRCADIAN}Circadian`, `circadianOn`],
    ];
  }

  public async header(group: GroupDTO): Promise<void> {
    this.applicationManager.setHeader(
      group.friendlyName,
      `${TitleCase(group.type)} Group`,
    );
    let maxId = 0;
    let maxName = 0;
    const lines: string[][] = [];
    // TODO: Refactor into 1 request, instead of n
    await each(group.entities, async id => {
      const content = await this.lightDomain.getState<LightStateDTO>(id);
      if (!content) {
        lines.push([chalk`  {red.bold Missing entity:} {yellow ${id}}`]);
        return;
      }
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
      .forEach(line =>
        this.screenService.print(
          line.length === SINGLE
            ? line[START]
            : chalk` {cyan -} ${line
                .shift()
                .padEnd(maxName, ' ')} {yellow.bold ${line
                .shift()
                .padEnd(maxId, ' ')}} ${line.shift()}`,
        ),
      );
    this.screenService.print();
  }

  public async processAction(group: GroupDTO, action: string): Promise<void> {
    switch (action) {
      case 'color':
        group = await this.refresh(group);
        return await this.promptChangeColor(group);
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
      item => item.state === 'on',
    ) as GeneralSaveStateDTO<LightAttributesDTO>[];
    onList.forEach(item => {
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

  public async promptChangeColor(group: GroupDTO): Promise<void> {
    let [r, g, b, divisor] = [OFF, OFF, OFF, OFF];
    const onList = group.state.states.filter(
      item => item.state === 'on',
    ) as GeneralSaveStateDTO<LightAttributesDTO>[];
    onList.forEach(item => {
      r += item.extra.rgb_color[R];
      g += item.extra.rgb_color[G];
      b += item.extra.rgb_color[B];
      divisor++;
    });
    r = Math.floor(r / divisor);
    g = Math.floor(g / divisor);
    b = Math.floor(b / divisor);
    const rgb = await this.colorService.buildRGB({ b, g, r });
    return await this.setColor(group, rgb);
  }

  public async refresh(group: GroupDTO | string): Promise<GroupDTO> {
    if (is.string(group)) {
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

  public async setColor({ _id }: GroupDTO, { r, g, b }: RGB): Promise<void> {
    await this.fetchService.fetch({
      body: {
        rgb_color: [r, g, b],
      },
      method: 'put',
      url: `/group/${_id}/expand`,
    });
  }

  public async turnOff(group: GroupDTO | string): Promise<void> {
    group = is.string(group) ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/turnOff`,
    });
  }

  public async turnOn(group: GroupDTO | string): Promise<void> {
    group = is.string(group) ? group : group._id;
    await this.fetchService.fetch({
      method: 'put',
      url: `/group/${group}/command/turnOn`,
    });
  }
}
