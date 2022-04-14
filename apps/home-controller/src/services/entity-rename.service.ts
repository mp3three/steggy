import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { UpdateEntityIdDTO } from '@steggy/controller-shared';
import { EntityManagerService } from '@steggy/home-assistant';
import { eachSeries } from '@steggy/utilities';

import { GroupService } from './groups';
import { RoomService } from './room.service';
import { RoutineService } from './routines';

@Injectable()
export class EntityRenameService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly groupService: GroupService,
    private readonly roomService: RoomService,
    private readonly routineService: RoutineService,
    private readonly entityManager: EntityManagerService,
  ) {}

  public async changeId(
    entityId: string,
    { id, rooms, groups }: UpdateEntityIdDTO,
  ): Promise<void> {
    await this.entityManager.updateId(entityId, id);
    if (rooms) {
      await this.renameInRooms(entityId, id);
    }
    if (groups) {
      await this.renameInGroups(entityId, id);
    }
  }

  private async renameInGroups(from: string, to: string): Promise<void> {
    const list = await this.groupService.list({
      filters: new Set([
        {
          field: 'entities',
          value: from,
        },
      ]),
    });
    await eachSeries(list, async group => {
      this.logger.debug(
        `(group) [${group.friendlyName}] rename entity {${from}} => {${to}} `,
      );
      await this.groupService.update(group._id, {
        entities: group.entities.map(i => (i === from ? to : i)),
      });
    });
  }

  private async renameInRooms(from: string, to: string): Promise<void> {
    const list = await this.roomService.list({
      filters: new Set([
        {
          field: 'entities',
          value: from,
        },
      ]),
    });
    await eachSeries(list, async room => {
      this.logger.debug(
        `(room) [${room.friendlyName}] rename entity {${from}} => {${to}} `,
      );
      await this.roomService.update(
        {
          entities: room.entities.map(i =>
            i.entity_id === from ? { entity_id: to } : i,
          ),
        },
        room._id,
      );
    });
  }
}
