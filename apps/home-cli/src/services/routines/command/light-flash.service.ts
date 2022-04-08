import { Injectable } from '@nestjs/common';
import {
  GROUP_TYPES,
  RountineCommandLightFlashDTO,
} from '@steggy/controller-shared';
import { HASS_DOMAINS } from '@steggy/home-assistant-shared';
import { ColorsService, ICONS, PromptService } from '@steggy/tty';
import { is } from '@steggy/utilities';

import { GroupCommandService } from '../../groups';
import { EntityService } from '../../home-assistant/entity.service';

const DEFAULT_DURATION = 1000;
const DEFAULT_INTERVAL = 500;

@Injectable()
export class LightFlashService {
  constructor(
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    private readonly groupService: GroupCommandService,
    private readonly colorService: ColorsService,
  ) {}

  public async build(
    current: Partial<RountineCommandLightFlashDTO> = {},
  ): Promise<RountineCommandLightFlashDTO> {
    current.type = await this.promptService.pickOne(
      `Target type`,
      [
        [`${ICONS.GROUPS}Group`, 'group'],
        [`${ICONS.ENTITIES}Entity`, 'entity'],
      ],
      current.type,
    );
    current.ref =
      current.type === 'group'
        ? await this.pickGroup(current.ref)
        : await this.pickEntity(current.ref);

    current.duration = await this.promptService.number(
      `Duration (ms)`,
      current.duration ?? DEFAULT_DURATION,
    );

    current.interval = await this.promptService.number(
      `Update interval (ms)`,
      current.interval ?? DEFAULT_INTERVAL,
    );

    if (
      !is.undefined(current.brightness) ||
      (await this.promptService.confirm(`Set brightness?`))
    ) {
      current.brightness = await this.promptService.number(
        `Brightness (0-255)`,
        current.brightness,
      );
    }
    if (
      !is.undefined(current.rgb) ||
      (await this.promptService.confirm(`Set color?`))
    ) {
      let hex = this.colorService.rgbToHEX(current.rgb);
      hex = await this.promptService.string(`Hex color`, hex);
      current.rgb = this.colorService.hexToRGB(hex);
    }
    return current as RountineCommandLightFlashDTO;
  }

  private async pickEntity(current: string): Promise<string> {
    return await this.entityService.pickInDomain(
      [HASS_DOMAINS.light],
      undefined,
      current,
    );
  }

  private async pickGroup(current: string): Promise<string> {
    const list = await this.groupService.list({
      filters: new Set([{ field: 'type', value: GROUP_TYPES.light }]),
    });
    const group = await this.groupService.pickOne(
      list.map(({ _id }) => _id),
      current,
    );
    return group._id;
  }
}
