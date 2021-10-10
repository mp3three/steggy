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

import { EntityService } from './entity.service';

@Injectable()
export class KunamiBuilderService {
  constructor(
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
  ) {}

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

  private async buildGroupCommand(
    group?: GroupDTO,
  ): Promise<KunamiSensorCommand> {
    const actions: PromptMenuItems = [];
    if (group.type === GROUP_TYPES.lock) {
      actions.push(
        {
          name: 'Lock',
          value: 'lock',
        },
        {
          name: 'Unlock',
          value: 'unlock',
        },
      );
    }
    if (
      [GROUP_TYPES.fan, GROUP_TYPES.light, GROUP_TYPES.switch].includes(
        group.type,
      )
    ) {
      actions.push(
        {
          name: 'Turn on',
          value: 'turnOn',
        },
        {
          name: 'Turn off',
          value: 'turnOff',
        },
      );
    }
    if (group.type === GROUP_TYPES.light) {
      actions.push(
        {
          name: 'Circadian Light',
          value: 'circadianLight',
        },
        {
          name: 'Dim Up',
          value: 'dimUp',
        },
        {
          name: 'Dim Down',
          value: 'dimDown',
        },
      );
    }
    if (group.type === GROUP_TYPES.fan) {
      actions.push(
        {
          name: 'Fan Seed Up',
          value: 'fanSpeedUp',
        },
        {
          name: 'Fan Speed Down',
          value: 'fanSpeedDown',
        },
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
    const out: Partial<KunamiSensorCommand> = {};
    out.command = command;
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
  private async buildRoomCommand(room?: RoomDTO): Promise<KunamiSensorCommand> {
    const actions: PromptMenuItems = [
      {
        name: 'Turn on',
        value: 'turnOn',
      },
      {
        name: 'Turn off',
        value: 'turnOff',
      },
    ];
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
    const out: Partial<KunamiSensorCommand> = {};

    out.command = command;
    if (command === 'setState') {
      out.saveStateId = await this.promptService.pickOne(
        `Which state`,
        room.save_states.map((save) => ({
          name: save.name,
          value: save.id,
        })),
      );
    }
    return out as KunamiSensorCommand;
  }
}
