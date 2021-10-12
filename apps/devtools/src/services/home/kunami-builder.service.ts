import {
  GROUP_TYPES,
  GroupDTO,
  KunamiSensor,
  KunamiSensorCommand,
  ROOM_SENSOR_TYPE,
  RoomDTO,
} from '@automagical/controller-logic';
import { HASS_DOMAINS } from '@automagical/home-assistant';
import { PromptMenuItems, PromptService } from '@automagical/tty';
import { IsEmpty } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';

import { EntityService } from './entity.service';
import { HomeFetchService } from './home-fetch.service';

const DEFAULT_RECORD_DURATION = 5;

@Injectable()
export class KunamiBuilderService {
  constructor(
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async buildGroupCommand(
    group?: GroupDTO,
  ): Promise<KunamiSensorCommand> {
    const actions: PromptMenuItems = [];
    if (group.type === GROUP_TYPES.lock) {
      actions.push(
        ...this.promptService.itemsFromObject({
          Lock: 'lock',
          Unlock: 'unlock',
        }),
      );
    }
    if (
      [GROUP_TYPES.fan, GROUP_TYPES.light, GROUP_TYPES.switch].includes(
        group.type,
      )
    ) {
      actions.push(
        ...this.promptService.itemsFromObject({
          'Turn Off': 'turnOff',
          'Turn On': 'turnOn',
        }),
      );
    }
    if (group.type === GROUP_TYPES.light) {
      actions.push(
        ...this.promptService.itemsFromObject({
          'Circadian Light': 'circadianLight',
          'Dim Down': 'dimDown',
          'Dim Up': 'dimUp',
        }),
      );
    }
    if (group.type === GROUP_TYPES.fan) {
      actions.push(
        ...this.promptService.itemsFromObject({
          'Fan Seed Up': 'fanSpeedUp',
          'Fan Speed Down': 'fanSpeedDown',
        }),
      );
    }
    if (!IsEmpty(group.save_states)) {
      actions.push({
        name: 'Set State',
        value: 'setState',
      });
    }

    const command = await this.promptService.pickOne(
      `Sequence action`,
      actions,
    );
    const out: Partial<KunamiSensorCommand> = {
      command,
    };
    if (command === 'setState') {
      out.saveStateId = await this.promptService.pickOne(
        `Which state`,
        group.save_states.map((save) => ({
          name: save.name,
          value: save.id,
        })),
      );
    }
    return out as KunamiSensorCommand;
  }

  public async buildRoomCommand(room?: RoomDTO): Promise<KunamiSensorCommand> {
    const actions: PromptMenuItems = this.promptService.itemsFromObject({
      'Turn Off': 'turnOff',
      'Turn On': 'turnOn',
    });
    if (!IsEmpty(room.save_states)) {
      actions.push({
        name: 'Set State',
        value: 'setState',
      });
    }
    const command = await this.promptService.pickOne(
      `Sequence action`,
      actions,
    );
    const out: Partial<KunamiSensorCommand> = {
      command,
    };
    if (command === 'setState') {
      out.saveStateId = await this.promptService.pickOne(
        `Which state`,
        room.save_states.map((save) => ({
          name: save.name,
          value: save.id,
        })),
      );
    }
    out.sensor = await this.entityService.pickOne([HASS_DOMAINS.sensor]);
    // const entity = await this.entityService.get(entity_id);
    const duration = await this.promptService.number(
      `Record changes for x seconds`,
      DEFAULT_RECORD_DURATION,
    );
    console.log(chalk.green(`Recording`));
    out.match = await this.fetchService.fetch({
      body: { duration },
      method: 'post',
      url: `/entity/record/${out.sensor}`,
    });
    console.log(chalk.red(`Done`));
    return out as KunamiSensorCommand;
  }

  public async create(
    type: 'room' | 'group',
  ): Promise<Omit<KunamiSensor, 'id'>> {
    const entity_id = await this.entityService.pickOne([HASS_DOMAINS.sensor]);
    const command =
      type === 'room'
        ? await this.buildRoomCommand()
        : await this.buildGroupCommand();
    return {
      command,
      entity_id,
      type: ROOM_SENSOR_TYPE.kunami,
    };
  }
}
