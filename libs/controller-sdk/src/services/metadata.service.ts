import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { MetadataDTO, RoomMetadataDTO } from '@steggy/controller-shared';
import { is, SINGLE } from '@steggy/utilities';
import { nextTick } from 'async';
import { isDateString, isNumberString } from 'class-validator';
import EventEmitter from 'eventemitter3';

import { ENTITY_METADATA_UPDATED } from '../typings';
import { ChronoService } from './misc/chrono.service';
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
    @Inject(forwardRef(() => ChronoService))
    private readonly chronoService: ChronoService,
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

  // eslint-disable-next-line radar/cognitive-complexity
  public resolveValue(
    metadata: RoomMetadataDTO,
    value: unknown,
  ): string | number | boolean | Date {
    switch (metadata.type) {
      case 'boolean':
        if (is.boolean(value)) {
          return value;
        }
        if (is.string(value)) {
          return ['true', 'y', 'checked'].includes(value.toLowerCase());
        }
        this.logger.error(
          { metadata, value },
          `Cannot coerce value to boolean`,
        );
        return false;
      case 'string':
        if (!is.string(value)) {
          this.logger.warn({ metadata, value }, `Value not provided as string`);
          return String(value);
        }
        return value;
      case 'date':
        if (is.date(value)) {
          return value;
        }
        if (is.string(value)) {
          if (isDateString(value)) {
            return new Date(value);
          }
          const [start] = this.chronoService.parse(value, false);
          if (is.date(start)) {
            return start;
          }
        }
        if (is.number(value)) {
          return new Date(value);
        }
        this.logger.error({ metadata, value }, `Cannot convert value to date`);
        return undefined;
      case 'number':
        if (is.number(value)) {
          return value;
        }
        if (is.string(value) && isNumberString(value)) {
          return Number(value);
        }
        this.logger.error(
          { metadata, value },
          `Cannot convert value to number`,
        );
        return undefined;
      case 'enum':
        if ((metadata.options ?? []).includes(value as string)) {
          return value as string;
        }
        this.logger.error({ metadata, value });
        return undefined;
    }
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
    nextTick(() => this.eventEmitter.emit(ENTITY_METADATA_UPDATED(flag)));
    return out;
  }
}
