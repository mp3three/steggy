import {
  BaseMongoService,
  BaseSchemaDTO,
  EncryptionService,
} from '@automagical/persistence';
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

import { ROOM_UPDATE, RoomDocument, RoomDTO } from '../../contracts';
const OK_RESPONSE = 1;

@Injectable()
export class RoomPersistenceService extends BaseMongoService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AutoLogService,
    @InjectModel(RoomDTO.name)
    private readonly roomModel: Model<RoomDocument>,
    private readonly encryptService: EncryptionService,
  ) {
    super();
  }

  @Trace()
  @ToClass(RoomDTO)
  public async create(
    room: Omit<RoomDTO, keyof BaseSchemaDTO>,
  ): Promise<RoomDTO> {
    room = this.encrypt(room);
    room = (await this.roomModel.create(room)).toObject();
    this.eventEmitter.emit(ROOM_UPDATE);
    return room;
  }

  @Trace()
  public async delete(state: RoomDTO | string): Promise<boolean> {
    const query = this.merge(typeof state === 'string' ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    delete query.deleted;
    const result = await this.roomModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    this.eventEmitter.emit(ROOM_UPDATE);
    return result.ok === OK_RESPONSE;
  }

  @Trace()
  @ToClass(RoomDTO)
  public async findById(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<RoomDTO> {
    const query = this.merge(state, control);
    const out = await this.modifyQuery(control, this.roomModel.findOne(query))
      .lean()
      .exec();
    return this.decrypt(out);
  }

  @Trace()
  @ToClass(RoomDTO)
  public async findMany(control: ResultControlDTO = {}): Promise<RoomDTO[]> {
    const query = this.merge(control);
    const out = await this.modifyQuery(control, this.roomModel.find(query))
      .lean()
      .exec();
    return this.decrypt(out);
  }

  @Trace()
  public async update(
    state: Omit<Partial<RoomDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<RoomDTO> {
    const query = this.merge(id);
    const result = await this.roomModel.updateOne(query, state).exec();
    if (result.ok === OK_RESPONSE) {
      this.eventEmitter.emit(ROOM_UPDATE);
      return await this.findById(id);
    }
  }

  @Trace()
  private decrypt<T extends RoomDTO | RoomDTO[]>(room: T): T {
    if (Array.isArray(room)) {
      return room.map((x) => this.decrypt(x)) as T;
    }
    return room;
  }

  @Trace()
  private encrypt({ settings, ...room }: RoomDTO): RoomDTO {
    room['settings_encrypted'] = this.encryptService.encrypt(settings ?? {});
    return room;
  }
}
