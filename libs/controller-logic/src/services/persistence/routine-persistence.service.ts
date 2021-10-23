import { RountineDocument, RoutineDTO } from '@automagical/controller-logic';
import { BaseMongoService, BaseSchemaDTO } from '@automagical/persistence';
import {
  AutoLogService,
  ResultControlDTO,
  ToClass,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from 'eventemitter2';
import { Model } from 'mongoose';

import { BASIC_STATE, ROUTINE_UPDATE } from '../../contracts';
const OK_RESPONSE = 1;

@Injectable()
export class RoutinePersistenceService extends BaseMongoService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AutoLogService,
    @InjectModel(RoutineDTO.name)
    private readonly model: Model<RountineDocument>,
  ) {
    super();
  }

  @Trace()
  @ToClass(RoutineDTO)
  public async create<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    state: RoutineDTO<GROUP_TYPE>,
  ): Promise<RoutineDTO<GROUP_TYPE>> {
    const out = (
      await this.model.create(state)
    ).toObject() as RoutineDTO<GROUP_TYPE>;
    return out;
  }

  @Trace()
  public async delete(state: RoutineDTO | string): Promise<boolean> {
    const query = this.merge(typeof state === 'string' ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    const result = await this.model
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    this.eventEmitter.emit(ROUTINE_UPDATE);
    return result.ok === OK_RESPONSE;
  }

  @Trace()
  @ToClass(RoutineDTO)
  public async findById<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<RoutineDTO<GROUP_TYPE>> {
    const query = this.merge(state, control);
    return (await this.modifyQuery(control, this.model.findOne(query))
      .lean()
      .exec()) as RoutineDTO<GROUP_TYPE>;
  }

  @Trace()
  @ToClass(RoutineDTO)
  public async findMany<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    control: ResultControlDTO = {},
  ): Promise<RoutineDTO<GROUP_TYPE>[]> {
    const query = this.merge(control);
    const out = (await this.modifyQuery(control, this.model.find(query))
      .lean()
      .exec()) as RoutineDTO<GROUP_TYPE>[];
    return out;
  }

  @Trace()
  public async update<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    state: Omit<Partial<RoutineDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<RoutineDTO<GROUP_TYPE>> {
    const query = this.merge(id);
    const result = await this.model.updateOne(query, state).exec();
    if (result.ok === OK_RESPONSE) {
      return await this.findById(id);
    }
  }
}
