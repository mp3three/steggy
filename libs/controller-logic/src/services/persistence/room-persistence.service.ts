import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AutoLogService, CastResult } from '@text-based/boilerplate';
import {
  ROOM_UPDATE,
  RoomDocument,
  RoomDTO,
} from '@text-based/controller-shared';
import {
  BaseMongoService,
  BaseSchemaDTO,
  EncryptionService,
} from '@text-based/persistence';
import { is, ResultControlDTO } from '@text-based/utilities';
import EventEmitter from 'eventemitter3';
import { Model } from 'mongoose';

@Injectable()
export class RoomPersistenceService extends BaseMongoService {
  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly logger: AutoLogService,
    @InjectModel(RoomDTO.name)
    private readonly roomModel: Model<RoomDocument>,
    private readonly encryptService: EncryptionService,
  ) {
    super();
  }

  @CastResult(RoomDTO)
  public async create(
    room: Omit<RoomDTO, keyof BaseSchemaDTO>,
  ): Promise<RoomDTO> {
    room = this.encrypt(room);
    // eslint-disable-next-line unicorn/no-await-expression-member
    room = (await this.roomModel.create(room)).toObject();
    this.eventEmitter.emit(ROOM_UPDATE);
    return room;
  }

  public async delete(state: RoomDTO | string): Promise<boolean> {
    const query = this.merge(is.string(state) ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    delete query.deleted;
    const result = await this.roomModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    this.eventEmitter.emit(ROOM_UPDATE);
    return result.acknowledged;
  }

  @CastResult(RoomDTO)
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

  @CastResult(RoomDTO)
  public async findMany(control: ResultControlDTO = {}): Promise<RoomDTO[]> {
    const query = this.merge(control);
    const out = await this.modifyQuery(control, this.roomModel.find(query))
      .lean()
      .exec();
    return this.decrypt(out);
  }

  public async update(
    state: Omit<Partial<RoomDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<RoomDTO> {
    const query = this.merge(id);
    const result = await this.roomModel.updateOne(query, state).exec();
    if (result.acknowledged) {
      this.eventEmitter.emit(ROOM_UPDATE);
      return await this.findById(id);
    }
  }

  private decrypt<T extends RoomDTO | RoomDTO[]>(room: T): T {
    if (Array.isArray(room)) {
      return room.map(x => this.decrypt(x)) as T;
    }
    return room;
  }

  private encrypt({ settings, ...room }: RoomDTO): RoomDTO {
    room['settings_encrypted'] = this.encryptService.encrypt(settings ?? {});
    return room;
  }
}
