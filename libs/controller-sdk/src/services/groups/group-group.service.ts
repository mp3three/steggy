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
import { each } from '@steggy/utilities';

import { GroupService } from '../group.service';
import { GroupPersistenceService } from '../persistence';
import { BaseGroupService } from './base-group.service';

@Injectable()
export class GroupGroupService extends BaseGroupService {
  constructor(
    protected readonly logger: AutoLogService,
    @Inject(forwardRef(() => GroupService))
    private readonly group: GroupService,
    protected readonly groupPersistence: GroupPersistenceService,
  ) {
    super();
  }

  public readonly GROUP_TYPE = GROUP_TYPES.group;

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
    const item = await this.group.load(group);
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
      await this.group.activateState(
        { group: state.ref, state: state.state },
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
