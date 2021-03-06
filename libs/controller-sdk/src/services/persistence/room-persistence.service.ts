import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AutoLogService, CastResult } from '@steggy/boilerplate';
import { ROOM_UPDATE, RoomDTO } from '@steggy/controller-shared';
import {
  BaseMongoService,
  BaseSchemaDTO,
  EncryptionService,
} from '@steggy/persistence';
import { is, ResultControlDTO } from '@steggy/utilities';
import EventEmitter from 'eventemitter3';
import { Model } from 'mongoose';

@Injectable()
export class RoomPersistenceService extends BaseMongoService {
  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly logger: AutoLogService,
    @InjectModel(RoomDTO.name)
    protected readonly model: Model<RoomDTO>,
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
    room = (await this.model.create(room)).toObject();
    this.eventEmitter.emit(ROOM_UPDATE, { created: room });
    return room;
  }

  public async delete(state: RoomDTO | string): Promise<boolean> {
    const query = this.merge(is.string(state) ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    delete query.deleted;
    const result = await this.model
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    this.eventEmitter.emit(ROOM_UPDATE, {
      _id: is.string(state) ? state : state._id,
    });
    return result.acknowledged;
  }

  @CastResult(RoomDTO)
  public async findById(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<RoomDTO> {
    const query = this.merge(state, control);
    const out = await this.modifyQuery(control, this.model.findOne(query))
      .lean()
      .exec();
    return this.decrypt(out);
  }

  @CastResult(RoomDTO)
  public async findMany(control: ResultControlDTO = {}): Promise<RoomDTO[]> {
    const query = this.merge(control);
    const out = await this.modifyQuery(control, this.model.find(query))
      .lean()
      .exec();
    return this.decrypt(out);
  }

  public async update(
    state: Omit<Partial<RoomDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<RoomDTO> {
    const query = this.merge(id);
    const result = await this.model.updateOne(query, state).exec();
    if (result.acknowledged) {
      const out = await this.findById(id);
      this.eventEmitter.emit(ROOM_UPDATE, { updated: out });
      return out;
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
