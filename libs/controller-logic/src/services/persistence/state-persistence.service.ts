import { BaseMongoService } from '@automagical/persistence';
import {
  AutoLogService,
  EmitAfter,
  ResultControlDTO,
  ToClass,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from 'eventemitter2';
import { Model } from 'mongoose';

import { GROUP_UPDATE, RoomStateDocument, RoomStateDTO } from '../../contracts';

const OK_RESPONSE = 1;

@Injectable()
export class StatePersistenceService extends BaseMongoService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AutoLogService,
    @InjectModel(RoomStateDTO.name)
    private readonly roomStateModel: Model<RoomStateDocument>,
  ) {
    super();
  }

  @Trace()
  @EmitAfter(GROUP_UPDATE, { emitData: 'result' })
  @ToClass(RoomStateDTO)
  public async create(state: RoomStateDTO): Promise<RoomStateDTO> {
    return (await this.roomStateModel.create(state)).toObject();
  }

  @Trace()
  @EmitAfter(GROUP_UPDATE, { emitData: 'result' })
  public async delete(state: RoomStateDTO | string): Promise<boolean> {
    const query = this.merge(typeof state === 'string' ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    const result = await this.roomStateModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === OK_RESPONSE;
  }
  @Trace()
  @ToClass(RoomStateDTO)
  public async findById(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<RoomStateDTO> {
    const query = this.merge(state, control);
    return await this.modifyQuery(control, this.roomStateModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(RoomStateDTO)
  public async findByName(
    state: string,
    { control }: { control: ResultControlDTO },
  ): Promise<RoomStateDTO> {
    const query = this.merge(
      {
        filters: new Set([
          {
            field: 'name',
            value: state,
          },
        ]),
      },
      control,
    );
    return await this.modifyQuery(control, this.roomStateModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(RoomStateDTO)
  public async findMany(
    control: ResultControlDTO = {},
  ): Promise<RoomStateDTO[]> {
    const query = this.merge(control);
    return await this.modifyQuery(control, this.roomStateModel.find(query))
      .lean()
      .exec();
  }

  @Trace()
  @EmitAfter(GROUP_UPDATE, { emitData: 'result' })
  public async update(
    state: RoomStateDTO,
    control: ResultControlDTO,
  ): Promise<RoomStateDTO> {
    const query = this.merge(control);
    const result = await this.roomStateModel.updateOne(query, state).exec();
    if (result.ok === OK_RESPONSE) {
      return await this.findById(state._id, { control });
    }
  }
}
