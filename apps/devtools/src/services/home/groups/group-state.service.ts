import {
  DuplicateStateDTO,
  GroupDTO,
  RoomStateDTO,
} from '@automagical/controller-logic';
import { HassStateDTO } from '@automagical/home-assistant';
import { CANCEL, PromptService } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { encode } from 'ini';
import inquirer from 'inquirer';

import { HomeFetchService } from '../home-fetch.service';
import type { GroupItem } from './group-command.service';
const EMPTY = 0;

@Injectable()
export class GroupStateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
  ) {}

  public async processState(group: GroupDTO, list: GroupDTO[]): Promise<void> {
    const action = await this.promptService.menuSelect([
      {
        name: 'List Available',
        value: 'list',
      },
      {
        name: 'Describe current',
        value: 'describe',
      },
      {
        name: 'Capture Current',
        value: 'capture',
      },
    ]);
    if (action === CANCEL) {
      return;
    }
    if (action === 'capture') {
      await this.fetchService.fetch({
        body: {
          name: await this.promptService.string(`Name for save state`),
        },
        method: 'post',
        url: `/group/${group._id}/snapshot`,
      });
      return;
    }
    if (action === 'describe') {
      const describe = await this.fetchService.fetch<HassStateDTO[]>({
        url: `/group/${group._id}/describe`,
      });
      console.log(JSON.stringify(describe, undefined, '  '));
      return;
    }

    const data = await this.fetchService.fetch<RoomStateDTO[]>({
      url: `/group/${group._id}/list-states`,
    });

    if (data.length === EMPTY) {
      this.logger.warn(`No states currently associated with group`);
      return;
    }

    const state = await this.promptService.pickOne(
      'Pick state',
      data.map((item) => {
        return {
          name: `item`,
          value: item,
        };
      }),
    );

    await this.stateAction(state, list);
  }

  private async sendSaveState(
    from: RoomStateDTO,
    list: GroupDTO[],
  ): Promise<void> {
    const targetGroup = await this.promptService.pickOne(
      `Target group`,
      list.map((value) => ({
        name: value.friendlyName,
        value,
      })),
    );
    const name = await this.promptService.string(`Save as`);
    // await this.fetchService.fetch({
    //   body: {
    //     entities: targetGroup.entities,
    //     group: targetGroup.name,
    //     name,
    //     room: targetGroup.room,
    //   } as DuplicateStateDTO,
    //   method: 'post',
    //   url: `/state/${from._id}/copy`,
    // });
  }

  private async stateAction(
    state: RoomStateDTO,
    list: GroupDTO[],
  ): Promise<void> {
    const stateAction = await this.promptService.menuSelect([
      {
        name: 'Activate',
        value: 'activate',
      },
      {
        name: 'Describe',
        value: 'describe',
      },
      new inquirer.Separator(),
      {
        name: 'Copy to another group',
        value: 'sendSaveState',
      },
      {
        name: 'Delete',
        value: 'delete',
      },
    ]);

    switch (stateAction) {
      case 'sendSaveState':
        await this.sendSaveState(state, list);
        return;
      case 'activate':
        await this.fetchService.fetch({
          method: 'put',
          url: `/state/${state._id}/activate`,
        });
        return;
      case 'describe':
        console.log(encode(state));
        return await this.stateAction(state, list);
      case 'delete':
        await this.fetchService.fetch({
          method: 'delete',
          url: `/state/${state._id}`,
        });
        return;
    }
  }
}
