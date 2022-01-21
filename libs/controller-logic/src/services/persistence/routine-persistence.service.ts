import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AutoLogService, CastResult } from '@text-based/boilerplate';
import { BaseMongoService, BaseSchemaDTO } from '@text-based/persistence';
import { is, ResultControlDTO } from '@text-based/utilities';
import EventEmitter from 'eventemitter3';
import { Model } from 'mongoose';

import { RountineDocument, ROUTINE_UPDATE, RoutineDTO } from '../../contracts';

@Injectable()
export class RoutinePersistenceService extends BaseMongoService {
  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly logger: AutoLogService,
    @InjectModel(RoutineDTO.name)
    private readonly model: Model<RountineDocument>,
  ) {
    super();
  }

  @CastResult(RoutineDTO)
  public async create(state: RoutineDTO): Promise<RoutineDTO> {
    const out = (await this.model.create(state)).toObject() as RoutineDTO;
    this.eventEmitter.emit(ROUTINE_UPDATE);
    return out;
  }

  public async delete(state: RoutineDTO | string): Promise<boolean> {
    const query = this.merge(is.string(state) ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    const result = await this.model
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    this.eventEmitter.emit(ROUTINE_UPDATE);
    return result.acknowledged;
  }

  @CastResult(RoutineDTO)
  public async findById(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<RoutineDTO> {
    const query = this.merge(state, control);
    return (await this.modifyQuery(control, this.model.findOne(query))
      .lean()
      .exec()) as RoutineDTO;
  }

  @CastResult(RoutineDTO)
  public async findMany(control: ResultControlDTO = {}): Promise<RoutineDTO[]> {
    const query = this.merge(control);
    const out = (await this.modifyQuery(control, this.model.find(query))
      .lean()
      .exec()) as RoutineDTO[];
    return out;
  }

  public async update(
    state: Omit<Partial<RoutineDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<RoutineDTO> {
    const query = this.merge(id);
    const result = await this.model.updateOne(query, state).exec();
    if (result.acknowledged) {
      this.eventEmitter.emit(ROUTINE_UPDATE);
      return await this.findById(id);
    }
  }
}
