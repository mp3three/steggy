import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  AttributeChangeActivateDTO,
  DebugReportDTO,
  GroupDTO,
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomMetadataComparisonDTO,
  RoutineActivateDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandStopProcessingDTO,
  RoutineCommandTriggerRoutineDTO,
  RoutineDTO,
  RoutineStateComparisonDTO,
  SetRoomMetadataCommandDTO,
} from '@steggy/controller-shared';
import { EntityManagerService } from '@steggy/home-assistant';
import { is } from '@steggy/utilities';

import { GroupService } from './groups';
import { RoomService } from './room.service';
import { RoutineService } from './routines';

@Injectable()
export class DebuggerService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly groupService: GroupService,
    private readonly roomService: RoomService,
    private readonly entityManager: EntityManagerService,
    private readonly routineService: RoutineService,
  ) {}

  /**
   * Verify all declared entities actually exist
   */
  public async findGroups(): Promise<GroupDTO[]> {
    const groups = await this.groupService.list();
    const entities = this.entityManager.listEntities();
    return groups.filter(group => {
      group.entities ??= [];
      return group.entities.every(entity => entities.includes(entity));
    });
  }

  /**
   * Verify groups have not been deleted, and all entities exist
   */
  public async findRooms(): Promise<RoomDTO[]> {
    const rooms = await this.roomService.list();
    const entities = this.entityManager.listEntities();
    const list = await this.groupService.list({ select: [] });
    const groups = new Set(list.map(({ _id }) => _id));
    return rooms.filter(room => {
      room.entities ??= [];
      return (
        room.entities.every(({ entity_id }) => entities.includes(entity_id)) ||
        room.groups.every(group => groups.has(group))
      );
    });
  }

  public async findRoutines(): Promise<RoutineDTO[]> {
    const routineList = await this.routineService.list();
    const roomList = await this.roomService.list({ select: [] });
    const groupList = await this.groupService.list({ select: [] });
    const entities = this.entityManager.listEntities();
    const groups = new Set(groupList.map(({ _id }) => _id));
    const routines = new Set(routineList.map(({ _id }) => _id));
    return routineList.filter(routine => {
      const validActivate = routine.activate.every(
        (activate: RoutineActivateDTO<AttributeChangeActivateDTO>) => {
          if (!['state_change', 'attribute'].includes(activate.type)) {
            return true;
          }
          return entities.includes(activate.activate.entity);
        },
      );
      if (!validActivate) {
        return true;
      }
      if (is.object(routine.enable)) {
        const validEnable = this.validateStopProcessing(
          routine.enable,
          entities,
          roomList,
        );
        if (!validEnable) {
          return true;
        }
      }
      return routine.command.every(command => {
        let room: RoomDTO;
        switch (command.type) {
          case 'group_action':
          case 'group_state':
            return groups.has(
              (command.command as RoutineCommandGroupActionDTO).group as string,
            );
          case 'entity_state':
            return entities.includes(
              (command.command as RoomEntitySaveStateDTO).ref,
            );
          case 'trigger_routine':
            return routines.has(
              (command.command as RoutineCommandTriggerRoutineDTO)
                .routine as string,
            );
          case 'room_state':
            room = roomList.find(
              ({ _id }) =>
                _id ===
                ((command.command as RoutineCommandRoomStateDTO)
                  .room as string),
            );
            if (!room) {
              return false;
            }
            return room.save_states.some(
              ({ id }) =>
                id ===
                ((command.command as RoutineCommandRoomStateDTO)
                  .state as string),
            );
          case 'set_room_metadata':
            room = roomList.find(
              ({ _id }) =>
                _id ===
                ((command.command as SetRoomMetadataCommandDTO).room as string),
            );
            return room.metadata.some(
              ({ name }) =>
                name ===
                ((command.command as SetRoomMetadataCommandDTO).name as string),
            );
          case 'stop_processing':
            return this.validateStopProcessing(
              command.command as RoutineCommandStopProcessingDTO,
              entities,
              roomList,
            );
        }
        return true;
      });
    });
  }

  public async sanityCheck(): Promise<DebugReportDTO> {
    const routines = await this.findRoutines();
    const rooms = await this.findRooms();
    const groups = await this.findGroups();
    return { groups, rooms, routines };
  }

  private validateStopProcessing(
    stop: RoutineCommandStopProcessingDTO,
    entities: string[],
    rooms: RoomDTO[],
  ): boolean {
    stop.comparisons ??= [];
    return stop.comparisons.every(compare => {
      switch (compare.type) {
        case 'attribute':
        case 'state':
          return entities.includes(
            (compare.comparison as RoutineStateComparisonDTO).entity_id,
          );
        case 'room_metadata':
          const room = rooms.find(
            ({ _id }) =>
              _id === (compare.comparison as RoomMetadataComparisonDTO).room,
          );
          return room.metadata.some(
            ({ name }) =>
              name ===
              (compare.comparison as RoomMetadataComparisonDTO).property,
          );
      }
      return true;
    });
  }
}
