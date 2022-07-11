import { Injectable, NotFoundException } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { CodeDTO } from '@steggy/controller-shared';
import { BaseSchemaDTO } from '@steggy/persistence';
import { is, ResultControlDTO } from '@steggy/utilities';

import { CodePersistenceService } from './persistence';

@Injectable()
export class CodeService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly codePersistence: CodePersistenceService,
  ) {}

  public async create(
    code: Omit<CodeDTO, keyof BaseSchemaDTO>,
  ): Promise<CodeDTO> {
    return await this.codePersistence.create(code);
  }

  public async delete(item: CodeDTO | string): Promise<boolean> {
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
    return await this.codePersistence.update(code, id);
  }
}
