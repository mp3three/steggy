/* eslint-disable radar/no-identical-functions */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  AttributeChangeActivateDTO,
  GeneralSaveStateDTO,
  RoutineActivateDTO,
  RoutineCommandDTO,
  RoutineCommandStopProcessingDTO,
  RoutineComparisonDTO,
  RoutineStateComparisonDTO,
  SequenceActivateDTO,
  UpdateEntityIdDTO,
} from '@steggy/controller-shared';
import { EntityManagerService } from '@steggy/home-assistant';
import { eachSeries, ResultControlDTO } from '@steggy/utilities';

import { GroupService } from '../group.service';
import { PersonService } from '../person.service';
import { RoomService } from '../room.service';
import { RoutineService } from '../routine.service';

type tStopProcessing = RoutineCommandDTO<
  RoutineCommandStopProcessingDTO<RoutineStateComparisonDTO>
>;

@Injectable()
export class EntityRenameService {
  constructor(
    private readonly logger: AutoLogService,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineService: RoutineService,
    @Inject(forwardRef(() => PersonService))
    private readonly personService: PersonService,
    private readonly entityManager: EntityManagerService,
  ) {}

  public async changeId(
    entityId: string,
    { id, rooms, groups, people }: UpdateEntityIdDTO,
  ): Promise<void> {
    this.logger.warn(
      `Beginning migration of entity ${entityId} to new entity_id ${id}`,
    );
    this.logger.info(`Updating entity in home assistant`);
    await this.entityManager.updateId(entityId, id);
    if (rooms) {
      await this.renameInRooms(entityId, id);
    }
    if (groups) {
      await this.renameInGroups(entityId, id);
    }
    if (groups) {
      await this.renameInRoutines(entityId, id);
    }
    if (people) {
      await this.renameInPeople(entityId, id);
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
    this.logger.info(`Updating ${list.length} groups`);
    await eachSeries(list, async group => {
      this.logger.debug(
        `(group) [${group.friendlyName}] rename entity {${from}} => {${to}} `,
      );
      group.entities ??= [];
      group.save_states ??= [];
      // update group
      await this.groupService.update(group._id, {
        // modifying entity lists
        entities: group.entities.map(i => (i === from ? to : i)),
        // and searching out entities inside save states
        save_states: group.save_states.map(state => {
          state.states = state.states.map(entity => {
            if (entity.ref === from) {
              entity.ref = to;
            }
            return entity;
          });
          return state;
        }),
      });
    });
  }

  private async renameInPeople(from: string, to: string): Promise<void> {
    const list = await this.personService.list({
      filters: new Set([
        {
          field: 'entities',
          value: from,
        },
      ]),
    });
    this.logger.info(`Updating ${list.length} people`);
    await eachSeries(list, async person => {
      this.logger.debug(
        `(person) [${person.friendlyName}] rename entity {${from}} => {${to}} `,
      );
      await this.personService.update(
        {
          // update entity references
          entities: person.entities.map(i =>
            i.entity_id === from ? { entity_id: to } : i,
          ),
          // search out and update save state references
          save_states: person.save_states.map(state => {
            state.states = state.states.map(change => {
              if (change.ref === from) {
                change.ref = to;
              }
              return change;
            });
            return state;
          }),
        },
        person._id,
      );
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
    this.logger.info(`Updating ${list.length} rooms`);
    await eachSeries(list, async room => {
      this.logger.debug(
        `(room) [${room.friendlyName}] rename entity {${from}} => {${to}} `,
      );
      await this.roomService.update(
        {
          // update entity references
          entities: room.entities.map(i =>
            i.entity_id === from ? { entity_id: to } : i,
          ),
          // search out and update save state references
          save_states: room.save_states.map(state => {
            state.states = state.states.map(change => {
              if (change.ref === from) {
                change.ref = to;
              }
              return change;
            });
            return state;
          }),
        },
        room._id,
      );
    });
  }

  private async renameInRoutines(from: string, to: string): Promise<void> {
    // KEEP THIS SEQUENTIAL!
    // Automated migrations don't need race conditions
    await this.renameInRoutines_activateAttribute(from, to);
    await this.renameInRoutines_activateSequence(from, to);
    await this.renameInRoutines_commandCallService(from, to);
    await this.renameInRoutines_commandStopProcessing(from, to);
    await this.renameInRoutines_enable(from, to);
  }

  private async renameInRoutines_activateAttribute(from, to): Promise<void> {
    const list = await this.routineService.list({
      filters: new Set([
        {
          field: 'activate.type',
          operation: 'in',
          value: ['attribute', 'state_change'],
        },
        {
          field: 'activate.activate.entity',
          value: from,
        },
      ]),
    } as ResultControlDTO);
    this.logger.info(
      `Updating ${list.length} routines containing state/attribute change commands`,
    );
    await eachSeries(list, async routine => {
      routine.activate = routine.activate.map(
        (activate: RoutineActivateDTO<AttributeChangeActivateDTO>) => {
          if (!['state_change', 'attribute'].includes(activate.type)) {
            return activate;
          }
          this.logger.debug(
            { activate },
            `[${routine.friendlyName}] changing entity {${to}}`,
          );
          if (activate.activate.entity === from) {
            activate.activate.entity = to;
          }
          return activate;
        },
      );
      await this.routineService.update(routine._id, routine);
    });
  }

  private async renameInRoutines_activateSequence(from, to): Promise<void> {
    const list = await this.routineService.list({
      filters: new Set([
        {
          field: 'activate.type',
          value: 'kunami',
        },
        {
          field: 'activate.activate.sensor',
          value: from,
        },
      ]),
    } as ResultControlDTO);
    this.logger.info(
      `Updating ${list.length} routines containing sequence commands`,
    );
    await eachSeries(list, async routine => {
      routine.activate = routine.activate.map(
        (activate: RoutineActivateDTO<SequenceActivateDTO>) => {
          if (activate.type !== 'kunami') {
            return activate;
          }
          this.logger.debug(
            { activate },
            `[${routine.friendlyName}] changing entity {${to}}`,
          );
          if (activate.activate.sensor === from) {
            activate.activate.sensor = to;
          }
          return activate;
        },
      );
      await this.routineService.update(routine._id, routine);
    });
  }

  private async renameInRoutines_commandCallService(from, to): Promise<void> {
    const list = await this.routineService.list({
      filters: new Set([
        {
          field: 'command.type',
          value: 'call_service',
        },
        {
          field: 'command.command.entity_id',
          value: from,
        },
      ]),
    } as ResultControlDTO);
    this.logger.info(
      `Updating ${list.length} routines containing entity state change commands`,
    );
    await eachSeries(list, async routine => {
      routine.command = routine.command.map(
        (command: RoutineCommandDTO<GeneralSaveStateDTO>) => {
          if (command.type !== 'call_service') {
            return command;
          }
          this.logger.debug(
            { command },
            `[${routine.friendlyName}] changing entity {${to}}`,
          );
          if (command.command.ref === from) {
            command.command.ref = to;
          }
          return command;
        },
      );
      await this.routineService.update(routine._id, routine);
    });
  }

  private async renameInRoutines_commandStopProcessing(
    from,
    to,
  ): Promise<void> {
    const list = await this.routineService.list({
      filters: new Set([
        {
          field: 'command.type',
          value: 'stop_processing',
        },
        {
          // oof
          field: 'command.command.comparisons.comparison.entity_id',
          value: from,
        },
      ]),
    } as ResultControlDTO);
    this.logger.info(
      `Updating ${list.length} routines containing stop processing commands`,
    );
    await eachSeries(list, async routine => {
      routine.command = routine.command.map((command: tStopProcessing) => {
        if (command.type !== 'stop_processing') {
          return command;
        }
        command.command.comparisons = command.command.comparisons.map(
          compare => {
            if (!['attribute', 'state'].includes(compare.type)) {
              return compare;
            }
            this.logger.debug(
              { command, compare },
              `[${routine.friendlyName}] changing comparison entity {${to}}`,
              // INDENT MOUNTAIN WINNER
            );
            if (compare.comparison.entity_id === from) {
              compare.comparison.entity_id = to;
            }
            return compare;
          },
        );
        return command;
      });
      await this.routineService.update(routine._id, routine);
    });
  }

  private async renameInRoutines_enable(from, to): Promise<void> {
    const list = await this.routineService.list({
      filters: new Set([
        {
          field: 'enable.comparisons.comparison.entity_id',
          value: from,
        },
      ]),
    } as ResultControlDTO);
    this.logger.info(
      `Updating ${list.length} routines with enable comparisons`,
    );
    await eachSeries(list, async routine => {
      routine.enable.comparisons = routine.enable.comparisons.map(
        (compare: RoutineComparisonDTO<RoutineStateComparisonDTO>) => {
          if (!['attribute', 'state'].includes(compare.type)) {
            return compare;
          }
          this.logger.debug(
            { command: compare },
            `[${routine.friendlyName}] changing comparison entity {${to}}`,
          );
          if (compare.comparison.entity_id === from) {
            compare.comparison.entity_id = to;
          }
          return compare;
        },
      );
      await this.routineService.update(routine._id, routine);
    });
  }
}
