import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { MetadataDTO } from '@steggy/controller-shared';
import { SINGLE } from '@steggy/utilities';
import EventEmitter from 'eventemitter3';

import { ENTITY_METADATA_UPDATED } from '../typings';
import { MetadataPersistenceService } from './persistence';

type EntityMetadata = {
  entity: string;
  flags?: string[];
};
const METADATA_TYPE = 'entity';

@Injectable()
export class MetadataService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly eventEmitter: EventEmitter,
    private readonly metadataPersistence: MetadataPersistenceService,
  ) {}

  public async addFlag(
    entity: string,
    flag: string,
  ): Promise<MetadataDTO<EntityMetadata>> {
    const result = ((await this.findByEntityId(entity)) ?? {
      type: METADATA_TYPE,
    }) as MetadataDTO<EntityMetadata>;
    result.data ??= { entity };
    result.data.flags ??= [];
    if (!result.data.flags.includes(flag)) {
      result.data.flags.push(flag);
    }
    return await this.save(flag, result);
  }

  public async create<T>(value: MetadataDTO<T>): Promise<MetadataDTO<T>> {
    return await this.metadataPersistence.create(value);
  }

  public async findWithFlag(flag: string): Promise<string[]> {
    const list = await this.metadataPersistence.findMany<EntityMetadata>({
      filters: new Set([
        { field: 'data.flags', value: flag },
        { field: 'type', value: METADATA_TYPE },
      ]),
    });
    return list
      .map(({ data }) => data.entity)
      .filter((item, index, array) => array.indexOf(item) === index);
  }

  public async getMetadata(
    entity: string,
  ): Promise<MetadataDTO<EntityMetadata>> {
    return await this.findByEntityId(entity);
  }

  public async removeFlag(
    entity: string,
    flag: string,
  ): Promise<MetadataDTO<EntityMetadata>> {
    const result = ((await this.findByEntityId(entity)) ?? {
      type: METADATA_TYPE,
    }) as MetadataDTO<EntityMetadata>;
    result.data ??= { entity };
    result.data.flags ??= [];
    result.data.flags = result.data.flags.filter(i => i !== flag);
    return await this.save(flag, result);
  }

  private async findByEntityId(
    entity: string,
  ): Promise<MetadataDTO<EntityMetadata>> {
    const [search] = await this.metadataPersistence.findMany<EntityMetadata>({
      filters: new Set([
        { field: 'data.entity', value: entity },
        { field: 'type', value: METADATA_TYPE },
      ]),
      limit: SINGLE,
    });
    return search;
  }

  private async save(
    flag: string,
    metadata: MetadataDTO<EntityMetadata>,
  ): Promise<MetadataDTO<EntityMetadata>> {
    const out = await this.metadataPersistence.save<EntityMetadata>(metadata);
    process.nextTick(() =>
      this.eventEmitter.emit(ENTITY_METADATA_UPDATED(flag)),
    );
    return out;
  }
}
