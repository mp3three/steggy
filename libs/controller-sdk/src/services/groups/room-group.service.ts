import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  GeneralSaveStateDTO,
  GROUP_TYPES,
  GroupCommandDTO,
  GroupDTO,
  ROOM_ENTITY_EXTRAS,
} from '@steggy/controller-shared';
import { each } from 'async';

import { GroupService } from '../group.service';
import { GroupPersistenceService } from '../persistence';
import { RoomService } from '../room.service';
import { BaseGroupService } from './base-group.service';

@Injectable()
export class RoomGroupService extends BaseGroupService {
  constructor(
    protected readonly logger: AutoLogService,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
    private readonly roomService: RoomService,
    protected readonly groupPersistence: GroupPersistenceService,
  ) {
    super();
  }

  public readonly GROUP_TYPE = GROUP_TYPES.room;

  public async activateCommand(
    group: GroupDTO | string,
    state: GroupCommandDTO,
    waitForChange = false,
  ): Promise<void> {
    await this.activateState(group, state.command, waitForChange);
  }

  public override async activateState(
    group: string | GroupDTO<ROOM_ENTITY_EXTRAS>,
    stateId: string,
    waitForChange?: boolean,
  ): Promise<void> {
    const item = await this.groupService.getWithStates(group);
    if (!item) {
      this.logger.error({ group }, `Cannot find group`);
      return;
    }
    const state = item.save_states.find(({ id }) => id === stateId);
    if (!state) {
      this.logger.error(
        `[${item.friendlyName}] Cannot find state {${stateId}}`,
      );
      return;
    }
    await each(state.states, async state => {
      await this.roomService.activateState(
        { room: state.ref, state: state.state },
        waitForChange,
      );
    });
  }

  public getState(): GeneralSaveStateDTO[] {
    return [];
  }

  public setState(): void {
    throw new NotImplementedException();
  }
}
