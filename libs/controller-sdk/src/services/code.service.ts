import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
} from '@steggy/boilerplate';
import { CodeDTO, CodeType } from '@steggy/controller-shared';
import { BaseSchemaDTO } from '@steggy/persistence';
import {
  DOWN,
  EMPTY,
  FilterDTO,
  is,
  ResultControlDTO,
  UP,
} from '@steggy/utilities';

import { CodePersistenceService } from './persistence';

const CACHE_KEY = (type: CodeType) => `PREFIX_CACHE_${type}`;

@Injectable()
export class CodeService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly codePersistence: CodePersistenceService,
    @InjectCache()
    private readonly cache: CacheManagerService,
  ) {}

  public async allTags(): Promise<string[]> {
    const code = await this.list({
      filters: new Set([
        {
          field: 'routine.tag',
          operation: 'empty',
          value: false,
        },
      ]),
      select: ['tags'] as (keyof CodeDTO)[],
    });
    return is
      .unique(code.flatMap(({ tags }) => tags))
      .filter(i => is.string(i));
  }

  public async code(type: CodeType): Promise<string> {
    const cached = await this.cache.get<string>(CACHE_KEY(type));
    if (!is.empty(cached)) {
      return cached;
    }
    const list = await this.list({
      filters: new Set<FilterDTO>([
        ...(type === CodeType.request
          ? [
              {
                field: 'type',
                value: CodeType.request,
              },
            ]
          : []),
        {
          field: 'enable',
          operation: 'ne',
          value: 'disable',
        },
      ]),
    });
    const out = list
      // ! Sorting V1
      // May be adjusted in the future
      .sort((a, b) => {
        // request > execute
        if (a.type === 'request' && b.type === 'execute') {
          return UP;
        }
        if (b.type === 'request' && a.type === 'execute') {
          return DOWN;
        }
        // sort by priority, lower numbers first
        // default value = 0
        a.priority ??= EMPTY;
        b.priority ??= EMPTY;
        if (a.priority > b.priority) {
          return UP;
        }
        if (b.priority > a.priority) {
          return DOWN;
        }
        // 🤷
        return a.friendlyName > b.friendlyName ? UP : DOWN;
      })
      .map(({ code }) => code)
      .join(`\n`);
    await this.cache.set(CACHE_KEY(type), out);
    return out;
  }

  public async create(
    code: Omit<CodeDTO, keyof BaseSchemaDTO>,
  ): Promise<CodeDTO> {
    await this.clearCache();
    return await this.codePersistence.create(code);
  }

  public async delete(item: CodeDTO | string): Promise<boolean> {
    await this.clearCache();
    return await this.codePersistence.delete(item);
  }

  public async list(control: ResultControlDTO = {}): Promise<CodeDTO[]> {
    return await this.codePersistence.findMany(control);
  }

  public async load(
    code: CodeDTO | string,
    control: ResultControlDTO = {},
  ): Promise<CodeDTO> {
    if (is.string(code)) {
      code = await this.codePersistence.findById(code, { control });
    }
    if (!code) {
      throw new NotFoundException();
    }
    return code;
  }

  public async update(
    code: Omit<Partial<CodeDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<CodeDTO> {
    const loaded = await this.load(id);
    if (!loaded) {
      throw new NotFoundException(id);
    }
    await this.clearCache();
    return await this.codePersistence.update(code, id);
  }

  private async clearCache(): Promise<void> {
    await this.cache.del(CACHE_KEY(CodeType.execute));
    await this.cache.del(CACHE_KEY(CodeType.request));
  }
}
