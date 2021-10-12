import { BaseMongoService, BaseSchemaDTO } from '@automagical/persistence';
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

import { ROOM_UPDATE, RoomDocument, RoomDTO } from '../../contracts';
const OK_RESPONSE = 1;

@Injectable()
export class RoomPersistenceService extends BaseMongoService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AutoLogService,
    @InjectModel(RoomDTO.name)
    private readonly roomModel: Model<RoomDocument>,
  ) {
    super();
  }

  @Trace()
  @EmitAfter(ROOM_UPDATE, { emitData: 'result' })
  @ToClass(RoomDTO)
  public async create(
    state: Omit<RoomDTO, keyof BaseSchemaDTO>,
  ): Promise<RoomDTO> {
    const room = (await this.roomModel.create(state)).toObject();
    this.logger.warn({
      input: state,
      output: room,
    });
    return room;
  }

  @Trace()
  @EmitAfter(ROOM_UPDATE, { emitData: 'result' })
  public async delete(state: RoomDTO | string): Promise<boolean> {
    const query = this.merge(typeof state === 'string' ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    delete query.deleted;
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
  @EmitAfter(ROOM_UPDATE, { emitData: 'result' })
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
