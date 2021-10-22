import { SaveStateDocument, SaveStateDTO } from '@automagical/controller-logic';
import { BaseMongoService, BaseSchemaDTO } from '@automagical/persistence';
import {
  AutoLogService,
  ResultControlDTO,
  ToClass,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BASIC_STATE } from '../../contracts/';
const OK_RESPONSE = 1;

@Injectable()
export class SaveStatePersistenceService extends BaseMongoService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectModel(SaveStateDTO.name)
    private readonly model: Model<SaveStateDocument>,
  ) {
    super();
  }

  @Trace()
  @ToClass(SaveStateDTO)
  public async create<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    state: SaveStateDTO<GROUP_TYPE>,
  ): Promise<SaveStateDTO<GROUP_TYPE>> {
    return (
      await this.model.create(state)
    ).toObject() as SaveStateDTO<GROUP_TYPE>;
  }

  @Trace()
  public async delete(state: SaveStateDTO | string): Promise<boolean> {
    const query = this.merge(typeof state === 'string' ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    const result = await this.model
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === OK_RESPONSE;
  }

  @Trace()
  @ToClass(SaveStateDTO)
  public async findById<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<SaveStateDTO<GROUP_TYPE>> {
    const query = this.merge(state, control);
    return (await this.modifyQuery(control, this.model.findOne(query))
      .lean()
      .exec()) as SaveStateDTO<GROUP_TYPE>;
  }

  @Trace()
  @ToClass(SaveStateDTO)
  public async findMany<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    control: ResultControlDTO = {},
  ): Promise<SaveStateDTO<GROUP_TYPE>[]> {
    const query = this.merge(control);
    return (await this.modifyQuery(control, this.model.find(query))
      .lean()
      .exec()) as SaveStateDTO<GROUP_TYPE>[];
  }

  @Trace()
  public async update<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    state: Omit<Partial<SaveStateDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<SaveStateDTO<GROUP_TYPE>> {
    const query = this.merge(id);
    const result = await this.model.updateOne(query, state).exec();
    if (result.ok === OK_RESPONSE) {
      return await this.findById(id);
    }
  }
}
