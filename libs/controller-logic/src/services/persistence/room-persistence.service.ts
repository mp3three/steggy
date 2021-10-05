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

import { RoomDocument, RoomDTO } from '../../contracts';
const OK_RESPONSE = 1;

@Injectable()
export class RoomPersistenceService extends BaseMongoService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectModel(RoomDTO.name)
    private readonly roomModel: Model<RoomDocument>,
  ) {
    super();
  }

  @Trace()
  @ToClass(RoomDTO)
  public async create(
    state: Omit<RoomDTO, keyof BaseSchemaDTO>,
  ): Promise<RoomDTO> {
    return (await this.roomModel.create(state)).toObject();
  }

  @Trace()
  public async delete(state: RoomDTO | string): Promise<boolean> {
    const query = this.merge(typeof state === 'string' ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    const result = await this.roomModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === OK_RESPONSE;
  }
  @Trace()
  @ToClass(RoomDTO)
  public async findById(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<RoomDTO> {
    const query = this.merge(state, control);
    return await this.modifyQuery(control, this.roomModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(RoomDTO)
  public async findByName(
    state: string,
    { control }: { control: ResultControlDTO },
  ): Promise<RoomDTO> {
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
    return await this.modifyQuery(control, this.roomModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(RoomDTO)
  public async findMany(control: ResultControlDTO = {}): Promise<RoomDTO[]> {
    const query = this.merge(control);
    return await this.modifyQuery(control, this.roomModel.find(query))
      .lean()
      .exec();
  }

  @Trace()
  public async update(
    state: Omit<Partial<RoomDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<RoomDTO> {
    const query = this.merge(id);
    const result = await this.roomModel.updateOne(query, state).exec();
    if (result.ok === OK_RESPONSE) {
      return await this.findById(id);
    }
  }
}
