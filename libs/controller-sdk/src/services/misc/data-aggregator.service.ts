import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { ROOM_METADATA_TYPES, tNestedObject } from '@steggy/controller-shared';
import { EntityManagerService } from '@steggy/home-assistant';
import { is } from '@steggy/utilities';
import { isNumberString } from 'class-validator';
import { set } from 'object-path';

import { PersonService } from '../person.service';
import { RoomService } from '../room.service';
import { SecretsService } from '../secrets.service';

type tMetadataType = `${ROOM_METADATA_TYPES}`;

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
  public async load(type?: tMetadataType): Promise<tNestedObject> {
    try {
      return {
        ...(await this.buildData(type)),
        ...this.fromSecrets(type),
      };
    } catch (error) {
      this.logger.error({ error });
      return {};
    }
  }

  private async buildData(type: tMetadataType): Promise<tNestedObject> {
    const documents = await this.fromDatabase(type);
    const entities = this.fromEntities(type);
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

  private async fromDatabase(type: tMetadataType): Promise<tNestedObject> {
    const people = await this.personService.list({
      select: ['name', 'metadata'],
    });
    const rooms = await this.roomService.list({ select: ['name', 'metadata'] });
    const out: tNestedObject = {};
    [...people, ...rooms].forEach(({ name, metadata }) => {
      if (is.empty(name) || is.empty(metadata)) {
        return;
      }
      if (type) {
        metadata = metadata.filter(i => i.type === type);
      }
      set(out, name, Object.fromEntries(metadata.map(i => [i.name, i.value])));
    });
    return out;
  }

  private fromEntities(type: tMetadataType): tNestedObject {
    const out: tNestedObject = {};
    this.entityManager.ENTITIES.forEach(({ state, attributes }, entity_id) => {
      if (
        type === 'number' &&
        (is.number(state) || (is.string(state) && isNumberString(state)))
      ) {
        state = Number(state);
        set(out, entity_id, Number(state));
      }
      Object.entries(attributes).forEach(([name, value]) => {
        if (is.number(value) || (is.string(value) && isNumberString(value))) {
          const [domain, id] = entity_id.split('.');
          set(
            out,
            `${domain}_attributes.${id}.${name.replace(' ', '_')}`,
            Number(value),
          );
        }
      });
    });
    return out;
  }

  private fromSecrets(type: tMetadataType): tNestedObject {
    const { secrets } = this.secretsService.buildMetadata();
    let entries = Object.entries(secrets);
    switch (type) {
      case 'number':
        entries = entries.filter(([, value]) => is.number(value));
        break;
      case 'string':
      case 'enum':
        entries = entries.filter(([, value]) => is.string(value));
        break;
    }
    return {
      secrets: Object.fromEntries(entries),
    } as tNestedObject;
  }
}
