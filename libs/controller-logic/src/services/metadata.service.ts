import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@text-based/boilerplate';
import { EntityMetadataDTO } from '@text-based/controller-shared';
import EventEmitter from 'eventemitter3';

import { ENTITY_METADATA_UPDATED } from '../types';
import { EntityMetadataPersistenceService } from './persistence';

@Injectable()
export class MetadataService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly eventEmitter: EventEmitter,
    private readonly entityMetadataPersistence: EntityMetadataPersistenceService,
  ) {}

  public async addFlag(
    entity: string,
    flag: string,
  ): Promise<EntityMetadataDTO> {
    const metadata = (await this.entityMetadataPersistence.findByEntityId(
      entity,
    )) ?? { entity };
    metadata.flags ??= [];
    if (!metadata.flags.includes(flag)) {
      metadata.flags.push(flag);
    }
    const out = await this.entityMetadataPersistence.save(metadata);
    process.nextTick(() => this.eventEmitter.emit(ENTITY_METADATA_UPDATED));
    return out;
  }

  public async findWithFlag(flag: string): Promise<string[]> {
    const list = await this.entityMetadataPersistence.findMany({
      filters: new Set([
        {
          field: 'flags',
          value: flag,
        },
      ]),
    });
    return list.map(({ entity }) => entity);
  }

  public async getMetadata(entity: string): Promise<EntityMetadataDTO> {
    return await this.entityMetadataPersistence.findByEntityId(entity);
  }

  public async removeFlag(
    entity: string,
    flag: string,
  ): Promise<EntityMetadataDTO> {
    const metadata = (await this.entityMetadataPersistence.findByEntityId(
      entity,
    )) ?? { entity };
    metadata.flags ??= [];
    metadata.flags = metadata.flags.filter(i => i !== flag);
    const out = await this.entityMetadataPersistence.save(metadata);
    process.nextTick(() => this.eventEmitter.emit(ENTITY_METADATA_UPDATED));
    return out;
  }
}
