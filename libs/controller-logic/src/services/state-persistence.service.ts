/* eslint-disable unicorn/no-array-callback-reference */

import { BaseMongoService } from '@automagical/persistence';
import {
  AutoLogService,
  ResultControlDTO,
  ToClass,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RoomStateDocument, RoomStateDTO } from '../contracts';

@Injectable()
export class StatePersistenceService extends BaseMongoService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectModel(RoomStateDTO.name)
    private roomStateModel: Model<RoomStateDocument>,
  ) {
    super();
  }

  @Trace()
  @ToClass(RoomStateDTO)
  public async create(state: RoomStateDTO): Promise<RoomStateDTO> {
    return (await this.roomStateModel.create(state)).toObject();
  }

  @Trace()
  public async delete(project: RoomStateDTO | string): Promise<boolean> {
    const query = this.merge(
      typeof project === 'string' ? project : project._id,
    );
    this.logger.debug({ query }, `delete query`);
    const result = await this.roomStateModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === 1;
  }
  @Trace()
  @ToClass(RoomStateDTO)
  public async findById(
    state: string,
    { control }: { control: ResultControlDTO },
  ): Promise<RoomStateDTO> {
    const query = this.merge(state, control);
    return await this.modifyQuery(control, this.roomStateModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(RoomStateDTO)
  public async findByName(
    project: string,
    { control }: { control: ResultControlDTO },
  ): Promise<RoomStateDTO> {
    const query = this.merge(
      {
        filters: new Set([
          {
            field: 'name',
            value: project,
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
  public async update(
    state: RoomStateDTO,
    control: ResultControlDTO,
  ): Promise<RoomStateDTO> {
    const query = this.merge(control);
    const result = await this.roomStateModel.updateOne(query, state).exec();
    if (result.ok === 1) {
      return await this.findById(state._id, { control });
    }
  }
}
