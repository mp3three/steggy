import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AutoLogService, CastResult } from '@steggy/boilerplate';
import { GROUP_UPDATE, ROOM_ENTITY_EXTRAS } from '@steggy/controller-shared';
import { GroupDTO } from '@steggy/controller-shared';
import { BaseMongoService, BaseSchemaDTO } from '@steggy/persistence';
import { is, ResultControlDTO } from '@steggy/utilities';
import EventEmitter from 'eventemitter3';
import { Model } from 'mongoose';

@Injectable()
export class GroupPersistenceService extends BaseMongoService {
  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly logger: AutoLogService,
    @InjectModel(GroupDTO.name)
    protected readonly model: Model<GroupDTO>,
  ) {
    super();
  }

  @CastResult(GroupDTO)
  public async create<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(state: GroupDTO<GROUP_TYPE>): Promise<GroupDTO<GROUP_TYPE>> {
    const group = (
      await this.model.create(state)
    ).toObject() as GroupDTO<GROUP_TYPE>;
    this.eventEmitter.emit(GROUP_UPDATE, { created: group });
    return group;
  }

  public async delete(state: GroupDTO | string): Promise<boolean> {
    const query = this.merge(is.string(state) ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    const result = await this.model
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    this.eventEmitter.emit(GROUP_UPDATE, {
      deleted: is.string(state) ? state : state._id,
    });
    return result.acknowledged;
  }

  @CastResult(GroupDTO)
  public async findById<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<GroupDTO<GROUP_TYPE>> {
    const query = this.merge(state, control);
    const out: unknown = await this.modifyQuery(
      control,
      this.model.findOne(query),
    )
      .lean()
      .exec();
    return out as GroupDTO<GROUP_TYPE>;
  }

  @CastResult(GroupDTO)
  public async findByName<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<GroupDTO<GROUP_TYPE>> {
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
    const out: unknown = await this.modifyQuery(
      control,
      this.model.findOne(query),
    )
      .lean()
      .exec();
    return out as GroupDTO<GROUP_TYPE>;
  }

  @CastResult(GroupDTO)
  public async findMany<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(control: ResultControlDTO = {}): Promise<GroupDTO<GROUP_TYPE>[]> {
    const query = this.merge(control);
    const out: unknown = await this.modifyQuery(control, this.model.find(query))
      .lean()
      .exec();
    return out as GroupDTO<GROUP_TYPE>[];
  }

  public async update<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    state: Omit<Partial<GroupDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<GroupDTO<GROUP_TYPE>> {
    const query = this.merge(id);
    const result = await this.model.updateOne(query, state).exec();
    this.logger.debug(
      {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
      },
      `Update group {${id}}`,
    );
    const group = await this.findById<GROUP_TYPE>(id);
    this.eventEmitter.emit(GROUP_UPDATE, { updated: group });
    return group;
  }
}
