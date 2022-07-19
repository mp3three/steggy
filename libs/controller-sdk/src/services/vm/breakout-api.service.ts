import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { RoutineActivateOptionsDTO } from '@steggy/controller-shared';
import {
  EntityManagerService,
  NotifyDomainService,
} from '@steggy/home-assistant';
import { domain } from '@steggy/home-assistant-shared';
import { is, START } from '@steggy/utilities';

import { iVMBreakoutAPI } from '../../typings';
import { GroupService } from '../group.service';
import { ChronoService } from '../misc';
import { PersonService } from '../person.service';
import { RoomService } from '../room.service';
import { RoutineService } from '../routine.service';
import { RoutineEnabledService } from '../routine-enabled.service';

@Injectable()
export class BreakoutAPIService implements iVMBreakoutAPI {
  constructor(
    private readonly logger: AutoLogService,
    private readonly chrono: ChronoService,
    private readonly entityManager: EntityManagerService,
    private readonly group: GroupService,
    private readonly person: PersonService,
    private readonly room: RoomService,
    private readonly routineEnabled: RoutineEnabledService,
    private readonly routine: RoutineService,
    private readonly notify: NotifyDomainService,
  ) {}

  /**
   * A flat ID listing of all routines the controller identifies as active.
   * Modifying this list has no effect
   */
  public get ACTIVE_ROUTINES(): string[] {
    return [...this.routineEnabled.ACTIVE_ROUTINES.values()];
  }

  /**
   * Execute a single command out of the routine.
   * Does not consider the enabled state of the routine
   */
  public async activateCommand(
    command: string,
    routine: string,
    waitForChange?: boolean,
    runId?: string,
  ): Promise<boolean> {
    return await this.routine.activateCommand(
      command,
      routine,
      waitForChange,
      runId,
    );
  }

  public async activateGroupState(
    group: string,
    state: string,
    waitForChange = false,
  ): Promise<void> {
    return await this.group.activateState(
      {
        group,
        state,
      },
      waitForChange,
    );
  }

  public async activatePersonState(
    person: string,
    state: string,
    waitForChange = false,
  ): Promise<void> {
    return await this.person.activateState(
      {
        person,
        state,
      },
      waitForChange,
    );
  }

  public async activateRoomState(
    room: string,
    state: string,
    waitForChange = false,
  ): Promise<void> {
    return await this.room.activateState(
      {
        room,
        state,
      },
      waitForChange,
    );
  }

  /**
   * Activate a routine, taking into account current disabled state, and race condition modifiers.
   * Depending on the options passed, and the current state of the routine, it is not guaranteed that it will execute
   */
  public async activateRoutine(
    routine: string,
    options?: RoutineActivateOptionsDTO,
    waitForChange?: boolean,
  ): Promise<void> {
    return await this.routine.activateRoutine(routine, options, waitForChange);
  }

  // that was the point
  // eslint-disable-next-line spellcheck/spell-checker
  /**
   * Convert an expression to a date, or date range
   *
   * - "thursmas" should return undefined
   * - "tomorrow" should return single date
   * - "Monday to Friday" should return pair of dates
   */
  public chronoParse(text: string): undefined | [Date] | [Date, Date] {
    const dv = Symbol();
    const out = this.chrono.parse(text, dv);
    return out[START] == dv ? undefined : (out as [Date] | [Date, Date]);
  }

  public ids(target: string): string[] {
    return [...this.entityManager.ENTITIES.keys()].filter(
      i => domain(i) === target,
    );
  }

  /**
   * Modify the enabled setting of a routine.
   * Cannot modify rules through this method, the web UI must be used for that
   */
  public async routineEnable(
    id: string,
    type: 'enable' | 'disable' | 'disable_rules' | 'enable_rules',
  ): Promise<void> {
    const routine = await this.routine.get(id);
    await this.routine.update(id, {
      enable: { ...routine.enable, type },
    });
  }

  /**
   * Convert a routine ID to a name that's excessively friendly for use with the logger
   *
   * [Routine] > [Child] > [Target Grandchild]
   */
  public routineSuperFriendlyName(id: string): string {
    return this.routine.superFriendlyName(id);
  }

  /**
   * @deprecated temporary placeholder, expect to go away
   */
  public async sendNotification(
    message: string,
    optional?: {
      data?: Record<string, unknown>;
      target?: string;
      title?: string;
    },
    waitForChange = false,
  ): Promise<void> {
    await this.notify.notify(message, optional, waitForChange);
  }

  /**
   * Modify the metadata for a room.
   * **DOES** perform type checking / coercion on the inside.
   * **DOES NOT** allow for the creation of new properties.
   *
   * Will automatically perform updates / routine activations related to the changing of this value.
   */
  public async updatePersonMetadata(
    idOrName: string,
    property: string,
    value: string | number | boolean | Date,
  ): Promise<void> {
    let person = await this.person.load(idOrName);
    if (!person) {
      const people = await this.person.list({
        filters: new Set([
          {
            field: 'name',
            value: idOrName,
          },
        ]),
      });
      if (is.empty(people)) {
        this.logger.error(`Cannot load person {${idOrName}}`);
        return;
      }
      person = people[START];
    }
    await this.person.updateMetadata(person._id, property, { value });
  }

  /**
   * Modify the metadata for a room.
   * **DOES** perform type checking / coercion on the inside.
   * **DOES NOT** allow for the creation of new properties.
   *
   * Will automatically perform updates / routine activations related to the changing of this value.
   */
  public async updateRoomMetadata(
    idOrName: string,
    property: string,
    value: string | number | boolean | Date,
  ): Promise<void> {
    let room = await this.room.load(idOrName);
    if (!room) {
      const rooms = await this.room.list({
        filters: new Set([
          {
            field: 'name',
            value: idOrName,
          },
        ]),
      });
      if (is.empty(rooms)) {
        this.logger.error(`Cannot load room {${idOrName}}`);
        return;
      }
      room = rooms[START];
    }
    await this.room.updateMetadata(room._id, property, { value });
  }
}
