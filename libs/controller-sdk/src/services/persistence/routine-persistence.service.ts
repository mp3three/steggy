import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AutoLogService, CastResult } from '@steggy/boilerplate';
import { ROUTINE_UPDATE, RoutineDTO } from '@steggy/controller-shared';
import { BaseMongoService, BaseSchemaDTO } from '@steggy/persistence';
import { is, ResultControlDTO } from '@steggy/utilities';
import EventEmitter from 'eventemitter3';
import { Model } from 'mongoose';

@Injectable()
export class RoutinePersistenceService extends BaseMongoService {
  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly logger: AutoLogService,
    @InjectModel(RoutineDTO.name)
    protected readonly model: Model<RoutineDTO>,
  ) {
    super();
  }

  @CastResult(RoutineDTO)
  public async create(state: RoutineDTO): Promise<RoutineDTO> {
    const out = (await this.model.create(state)).toObject() as RoutineDTO;
    this.eventEmitter.emit(ROUTINE_UPDATE, { created: out });
    return out;
  }

  public async delete(state: RoutineDTO | string): Promise<boolean> {
    state = is.string(state) ? await this.findById(state) : state;
    const query = this.merge(is.string(state) ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    const deleted = Date.now();
    const result = await this.model.updateOne(query, { deleted }).exec();
    this.eventEmitter.emit(ROUTINE_UPDATE, { deleted: state });
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
      const out = await this.findById(id);
      this.eventEmitter.emit(ROUTINE_UPDATE, { updated: out });
      return out;
    }
  }
}
