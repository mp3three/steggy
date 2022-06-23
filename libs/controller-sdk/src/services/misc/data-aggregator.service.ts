import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { EntityManagerService } from '@steggy/home-assistant';
import { is } from '@steggy/utilities';
import { isNumberString } from 'class-validator';
import { set } from 'object-path';

import { PersonService } from '../person.service';
import { RoomService } from '../room.service';
import { SecretsService } from '../secrets.service';

type tNestedObject = Record<string, Record<string, number>>;

@Injectable()
export class DataAggregatorService {
  constructor(
    private readonly logger: AutoLogService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    @Inject(forwardRef(() => PersonService))
    private readonly personService: PersonService,
    private readonly secretsService: SecretsService,
    private readonly entityManager: EntityManagerService,
  ) {}

  /**
   * Aggregate data from:
   * - secrets
   * - people
   * - rooms
   * - entities
   *
   * Pass as variables for math expression to use
   */
  public async exec(): Promise<tNestedObject> {
    return {
      ...(await this.buildData()),
      ...this.fromSecrets(),
    };
  }
  private async buildData(): Promise<tNestedObject> {
    const documents = await this.fromDatabase();
    const entities = this.fromEntities();
    const domains = Object.keys(entities);
    Object.keys(documents).forEach(key => {
      if (domains.includes(key)) {
        // 🦶🔫
        this.logger.warn(
          `[${key}] document / domain collision {(document wins)}`,
        );
      }
    });
    return {
      ...entities,
      ...documents,
    };
  }

  private async fromDatabase(): Promise<tNestedObject> {
    const people = await this.personService.list({
      select: ['name', 'metadata'],
    });
    const rooms = await this.roomService.list({ select: ['name', 'metadata'] });
    const out: tNestedObject = {};
    [...people, ...rooms].forEach(({ name, metadata }) =>
      set(
        out,
        name,
        Object.fromEntries(
          metadata.filter(i => i.type === 'number').map(i => [i.name, i.value]),
        ),
      ),
    );
    return out;
  }

  private fromEntities(): tNestedObject {
    const out: tNestedObject = {};
    this.entityManager.ENTITIES.forEach(({ state }, entity_id) => {
      if (is.number(state) || (is.string(state) && isNumberString(state))) {
        set(out, entity_id, Number(state));
      }
    });
    return out;
  }

  private fromSecrets(): tNestedObject {
    const { secrets } = this.secretsService.buildMetadata();
    return {
      secrets: Object.fromEntries(
        Object.entries(secrets).filter(([, value]) => is.number(value)),
      ),
    } as tNestedObject;
  }
}
