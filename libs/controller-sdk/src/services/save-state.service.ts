import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RoomStateDTO } from '@steggy/controller-shared';
import { each } from '@steggy/utilities';

import { EntityCommandRouterService } from './entities';
import { GroupService } from './group.service';
import { RoomService } from './room.service';

@Injectable()
export class SaveStateService {
  constructor(
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
    private readonly commandRouter: EntityCommandRouterService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
  ) {}

  public async activateState(
    state: RoomStateDTO,
    waitForChange = false,
  ): Promise<void> {
    await Promise.all([
      await each(state?.states, async state => {
        if (state.type !== 'entity') {
          return;
        }
        await this.commandRouter.process(
          state.ref,
          state.state,
          state.extra as Record<string, unknown>,
          waitForChange,
        );
      }),
      await each(state.states, async state => {
        if (state.type !== 'group') {
          return;
        }
        await this.groupService.activateState(
          { group: state.ref, state: state.state },
          waitForChange,
        );
      }),
      await each(state.states, async state => {
        if (state.type !== 'room') {
          return;
        }
        await this.roomService.activateState(
          { room: state.ref, state: state.state },
          waitForChange,
        );
      }),
    ]);
  }
}
