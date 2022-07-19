import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  AttributeChangeActivateDTO,
  CallServiceCommandDTO,
  DebugReportDTO,
  GroupDTO,
  MetadataComparisonDTO,
  PersonDTO,
  RoomDTO,
  RoutineActivateDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandStopProcessingDTO,
  RoutineCommandTriggerRoutineDTO,
  RoutineDTO,
  RoutineStateComparisonDTO,
  SetRoomMetadataCommandDTO,
} from '@steggy/controller-shared';
import { EntityManagerService } from '@steggy/home-assistant';
import { is } from '@steggy/utilities';

import { GroupService } from '../group.service';
import { PersonService } from '../person.service';
import { RoomService } from '../room.service';
import { RoutineService } from '../routine.service';

// Probably worth a refactor in the future
// The reality of the complexity in this case isn't too bad
/* eslint-disable radar/cognitive-complexity */

@Injectable()
export class DebuggerService {
  constructor(
    private readonly logger: AutoLogService,
    @Inject(forwardRef(() => GroupService))
    private readonly group: GroupService,
    @Inject(forwardRef(() => RoomService))
    private readonly room: RoomService,
    private readonly entityManager: EntityManagerService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routine: RoutineService,
    @Inject(forwardRef(() => PersonService))
    private readonly person: PersonService,
  ) {}

  /**
   * Verify all declared entities actually exist
   */
  public async findGroups(): Promise<GroupDTO[]> {
    const groups = await this.group.list();
    const entities = this.entityManager.listEntities();
    return groups.filter(group => {
      group.entities ??= [];
      return !group.entities.every(entity => {
        const exists = entities.includes(entity);
        if (!exists) {
          this.logger.warn(
            `Group [${group.friendlyName}] missing entity {${entity}}`,
          );
        }
        return exists;
      });
    });
  }

  /**
   * Verify groups have not been deleted, and all entities exist
   */
  public async findRooms(): Promise<RoomDTO[]> {
    const rooms = await this.room.list();
    const entities = this.entityManager.listEntities();
    const list = await this.group.list({ select: [] });
    const groups = new Set(list.map(({ _id }) => _id));
    return rooms.filter(room => {
      room.entities ??= [];
      return (
        !room.entities.every(({ entity_id }) => {
          const exists = entities.includes(entity_id);
          if (!exists) {
            this.logger.warn(
              `Room [${room.friendlyName}] missing entity {${entity_id}}`,
            );
          }
          return exists;
        }) ||
        !room.groups.every(group => {
          const exists = groups.has(group);
          if (!exists) {
            this.logger.warn(
              `Room [${room.friendlyName}] missing group {${group}}`,
            );
          }
          return exists;
        })
      );
    });
  }

  public async findRoutines(): Promise<RoutineDTO[]> {
    const routineList = await this.routine.list();
    const roomList = await this.room.list({ select: [] });
    const personList = await this.person.list({ select: [] });
    const groupList = await this.group.list({ select: [] });
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
          this.logger.warn(`[${routine.friendlyName}] broken enable`);
          return true;
        }
      }
      return !routine.command.every(command => {
        let room: RoomDTO;
        let person: PersonDTO;
        let exists = true;
        switch (command.type) {
          // GROUP STUFF
          case 'group_action':
          case 'group_state':
            exists = groups.has(
              (command.command as RoutineCommandGroupActionDTO).group as string,
            );
            if (!exists) {
              this.logger.warn(
                `Routine command [${routine.friendlyName}]>[${
                  command.friendlyName
                }] refers to missing group {${
                  (command.command as RoutineCommandGroupActionDTO).group
                }}`,
              );
            } else if (command.type === 'group_state') {
              const group = groupList.find(
                ({ _id }) =>
                  _id ===
                  (command.command as RoutineCommandGroupActionDTO).group,
              );
              exists = group.save_states.some(
                ({ id }) =>
                  id === (command.command as RoutineCommandGroupStateDTO).state,
              );
              if (!exists) {
                this.logger.warn(
                  `Routine command [${routine.friendlyName}]>[${
                    command.friendlyName
                  }] refers to missing state {${
                    (command.command as RoutineCommandGroupStateDTO).state
                  }} in group [${group.friendlyName}]`,
                );
              }
            }
            return exists;

          // ENTITIES
          case 'call_service':
            exists = entities.includes(
              (command.command as CallServiceCommandDTO).entity_id,
            );
            if (!exists) {
              this.logger.warn(
                `Routine command [${routine.friendlyName}]>[${
                  command.friendlyName
                }] refers to missing entity {${
                  (command.command as CallServiceCommandDTO).entity_id
                }}`,
              );
            }
            return exists;

          // ROUTINE
          case 'trigger_routine':
            exists = routines.has(
              (command.command as RoutineCommandTriggerRoutineDTO)
                .routine as string,
            );
            if (!exists) {
              this.logger.warn(
                `Routine command [${routine.friendlyName}]>[${
                  command.friendlyName
                }] refers to missing routine {${
                  (command.command as RoutineCommandTriggerRoutineDTO).routine
                }}`,
              );
            }
            return exists;

          // ROOM STATE
          case 'room_state':
            room = roomList.find(
              ({ _id }) =>
                _id ===
                ((command.command as RoutineCommandRoomStateDTO)
                  .room as string),
            );
            if (!room) {
              this.logger.warn(
                `Routine command [${routine.friendlyName}]>[${
                  command.friendlyName
                }] refers to state from missing room {${
                  (command.command as RoutineCommandRoomStateDTO).room
                }}`,
              );
              return false;
            }
            exists = room.save_states.some(
              ({ id }) =>
                id ===
                ((command.command as RoutineCommandRoomStateDTO)
                  .state as string),
            );
            if (!exists) {
              this.logger.warn(
                `Routine command [${routine.friendlyName}]>[${
                  command.friendlyName
                }] refers to missing state {${
                  (command.command as RoutineCommandRoomStateDTO).state
                }} in room [${room.friendlyName}]`,
              );
            }
            return exists;

          // SET METADATA
          case 'set_metadata':
            if (
              (command.command as SetRoomMetadataCommandDTO).type === 'person'
            ) {
              person = personList.find(
                ({ _id }) =>
                  _id ===
                  ((command.command as SetRoomMetadataCommandDTO)
                    .room as string),
              );
              if (!person) {
                this.logger.warn(
                  `Routine command [${routine.friendlyName}]>[${
                    command.friendlyName
                  }] refers to metadata from missing person {${
                    (command.command as SetRoomMetadataCommandDTO).room
                  }}`,
                );
                return false;
              }
              exists = person.metadata.some(
                ({ name }) =>
                  name ===
                  ((command.command as SetRoomMetadataCommandDTO)
                    .name as string),
              );
              if (!exists) {
                this.logger.warn(
                  `Routine command [${routine.friendlyName}]>[${
                    command.friendlyName
                  }] refers to missing metadata {${
                    (command.command as RoutineCommandRoomStateDTO).room
                  }} in person [${person.friendlyName}]`,
                );
              }
              return exists;
            }
            room = roomList.find(
              ({ _id }) =>
                _id ===
                ((command.command as SetRoomMetadataCommandDTO).room as string),
            );
            if (!room) {
              this.logger.warn(
                `Routine command [${routine.friendlyName}]>[${
                  command.friendlyName
                }] refers to metadata from missing room {${
                  (command.command as SetRoomMetadataCommandDTO).room
                }}`,
              );
              return false;
            }
            exists = room.metadata.some(
              ({ name }) =>
                name ===
                ((command.command as SetRoomMetadataCommandDTO).name as string),
            );
            if (!exists) {
              this.logger.warn(
                `Routine command [${routine.friendlyName}]>[${
                  command.friendlyName
                }] refers to missing metadata {${
                  (command.command as RoutineCommandRoomStateDTO).room
                }} in room [${room.friendlyName}]`,
              );
            }
            return exists;

          // STOP PROCESSING
          case 'stop_processing':
            exists = this.validateStopProcessing(
              command.command as RoutineCommandStopProcessingDTO,
              entities,
              roomList,
            );
            if (!exists) {
              this.logger.warn(
                `Routine command [${routine.friendlyName}]>[${command.friendlyName}] contains broken stop processing comparison`,
              );
            }
            return exists;
        }
        return exists;
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
    if (!stop) {
      // Super duper invalid
      return false;
    }
    stop.comparisons ??= [];
    return stop.comparisons.every(compare => {
      let exists = true;
      switch (compare.type) {
        case 'attribute':
        case 'state':
          exists = entities.includes(
            (compare.comparison as RoutineStateComparisonDTO).entity_id,
          );
          if (!exists) {
            this.logger.warn(
              `Stop comparison [${
                compare.friendlyName
              }] refers to missing entity {${
                (compare.comparison as RoutineStateComparisonDTO).entity_id
              }}`,
            );
          }
          return exists;
        case 'metadata':
          const room = rooms.find(
            ({ _id }) =>
              _id === (compare.comparison as MetadataComparisonDTO).room,
          );
          if (!room) {
            this.logger.warn(
              `Stop comparison [${
                compare.friendlyName
              }] refers to metadata from missing room {${
                (compare.comparison as MetadataComparisonDTO).room
              }}`,
            );
            return false;
          }
          exists = room.metadata.some(
            ({ name }) =>
              name === (compare.comparison as MetadataComparisonDTO).property,
          );
          if (!exists) {
            this.logger.warn(
              `Stop comparison [${
                compare.friendlyName
              }] refers to missing metadata {${
                (compare.comparison as MetadataComparisonDTO).property
              }} in room [${room.friendlyName}]`,
            );
          }
          return exists;
      }
      return exists;
    });
  }
}
