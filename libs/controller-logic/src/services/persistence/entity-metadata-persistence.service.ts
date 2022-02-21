import { AutoLogService, CastResult } from '@automagical/boilerplate';
import {
  EntityMetadataDocument,
  EntityMetadataDTO,
} from '@automagical/controller-shared';
import { BaseMongoService, BaseSchemaDTO } from '@automagical/persistence';
import { is, ResultControlDTO } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EntityMetadataPersistenceService extends BaseMongoService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectModel(EntityMetadataDTO.name)
    private readonly entityMetadataModel: Model<EntityMetadataDocument>,
  ) {
    super();
  }

  @CastResult(EntityMetadataDTO)
  public async create(
    room: Omit<EntityMetadataDTO, keyof BaseSchemaDTO>,
  ): Promise<EntityMetadataDTO> {
    // eslint-disable-next-line unicorn/no-await-expression-member
    room = (await this.entityMetadataModel.create(room)).toObject();
    return room;
  }

  public async delete(state: EntityMetadataDTO | string): Promise<boolean> {
    const query = this.merge(is.string(state) ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    delete query.deleted;
    const result = await this.entityMetadataModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.acknowledged;
  }

  @CastResult(EntityMetadataDTO)
  public async findByEntityId(
    entity_id: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<EntityMetadataDTO> {
    const query = this.merge(
      { filters: new Set([{ field: 'entity', value: entity_id }]) },
      control,
    );
    const out = await this.modifyQuery(
      control,
      this.entityMetadataModel.findOne(query),
    )
      .lean()
      .exec();
    return out;
  }

  @CastResult(EntityMetadataDTO)
  public async findById(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<EntityMetadataDTO> {
    const query = this.merge(state, control);
    const out = await this.modifyQuery(
      control,
      this.entityMetadataModel.findOne(query),
    )
      .lean()
      .exec();
    return out;
  }

  @CastResult(EntityMetadataDTO)
  public async findMany(
    control: ResultControlDTO = {},
  ): Promise<EntityMetadataDTO[]> {
    const query = this.merge(control);
    const out = await this.modifyQuery(
      control,
      this.entityMetadataModel.find(query),
    )
      .lean()
      .exec();
    return out;
  }

  public async save(item: EntityMetadataDTO): Promise<EntityMetadataDTO> {
    if (item._id) {
      return await this.update(item, item._id);
    }
    return await this.create(item);
  }

  public async update(
    state: Omit<Partial<EntityMetadataDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<EntityMetadataDTO> {
    const query = this.merge(id);
    const result = await this.entityMetadataModel
      .updateOne(query, state)
      .exec();
    if (result.acknowledged) {
      return await this.findById(id);
    }
  }
}
