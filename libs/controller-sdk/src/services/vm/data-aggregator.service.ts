import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { ROOM_METADATA_TYPES, tNestedObject } from '@steggy/controller-shared';
import { EntityManagerService } from '@steggy/home-assistant';
import { is } from '@steggy/utilities';
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
    private readonly room: RoomService,
    @Inject(forwardRef(() => PersonService))
    private readonly person: PersonService,
    private readonly secrets: SecretsService,
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
        ...(await this.buildData()),
        ...this.fromSecrets(type),
      };
    } catch (error) {
      this.logger.error({ error });
      return {};
    }
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
      ...documents,
      home_assistant: entities,
    };
  }

  private async fromDatabase(): Promise<tNestedObject> {
    const people = await this.person.list({
      select: ['name', 'metadata'],
    });
    const rooms = await this.room.list({ select: ['name', 'metadata'] });
    const out: tNestedObject = {};
    [...people, ...rooms].forEach(({ name, metadata }) => {
      if (is.empty(name) || is.empty(metadata)) {
        return;
      }
      set(out, name, Object.fromEntries(metadata.map(i => [i.name, i.value])));
    });
    return out;
  }

  private fromEntities(): tNestedObject {
    const out: tNestedObject = {};
    this.entityManager.ENTITIES.forEach((entity, entity_id) => {
      set(out, entity_id, entity);
    });
    return out;
  }

  private fromSecrets(type: tMetadataType): tNestedObject {
    const { secrets } = this.secrets.buildMetadata();
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
