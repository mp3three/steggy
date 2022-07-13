import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AutoLogService, CastResult } from '@steggy/boilerplate';
import { CODE_UPDATE, CodeDTO, GROUP_UPDATE } from '@steggy/controller-shared';
import { BaseMongoService, BaseSchemaDTO } from '@steggy/persistence';
import { is, ResultControlDTO } from '@steggy/utilities';
import EventEmitter from 'eventemitter3';
import { Model } from 'mongoose';

@Injectable()
export class CodePersistenceService extends BaseMongoService {
  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly logger: AutoLogService,
    @InjectModel(CodeDTO.name)
    protected readonly model: Model<CodeDTO>,
  ) {
    super();
  }

  @CastResult(CodeDTO)
  public async create(state: CodeDTO): Promise<CodeDTO> {
    const code = (await this.model.create(state)).toObject() as CodeDTO;
    this.eventEmitter.emit(GROUP_UPDATE, { created: code });
    return code;
  }

  public async delete(state: CodeDTO | string): Promise<boolean> {
    const query = this.merge(is.string(state) ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    const result = await this.model
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    this.eventEmitter.emit(CODE_UPDATE, {
      deleted: is.string(state) ? state : state._id,
    });
    return result.acknowledged;
  }

  @CastResult(CodeDTO)
  public async findById(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<CodeDTO> {
    const query = this.merge(state, control);
    const out = (await this.modifyQuery(control, this.model.findOne(query))
      .lean()
      .exec()) as CodeDTO;
    return out;
  }

  @CastResult(CodeDTO)
  public async findMany(control: ResultControlDTO = {}): Promise<CodeDTO[]> {
    const query = this.merge(control);
    const out = (await this.modifyQuery(control, this.model.find(query))
      .lean()
      .exec()) as CodeDTO[];
    return out;
  }

  public async update(
    state: Omit<Partial<CodeDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<CodeDTO> {
    const query = this.merge(id);
    const result = await this.model.updateOne(query, state).exec();
    this.logger.debug(
      {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
      },
      `Update code {${id}}`,
    );
    const code = await this.findById(id);
    this.eventEmitter.emit(CODE_UPDATE, { updated: code });
    return code;
  }
}
