import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AutoLogService, CastResult } from '@steggy/boilerplate';
import { MetadataDocument, MetadataDTO } from '@steggy/controller-shared';
import { BaseMongoService, BaseSchemaDTO } from '@steggy/persistence';
import { is, ResultControlDTO } from '@steggy/utilities';
import { Model } from 'mongoose';

@Injectable()
export class MetadataPersistenceService extends BaseMongoService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectModel(MetadataDTO.name)
    private readonly ServerMetadataModel: Model<MetadataDocument>,
  ) {
    super();
  }

  @CastResult(MetadataDTO)
  public async create<T>(
    item: Omit<MetadataDTO<T>, keyof BaseSchemaDTO>,
  ): Promise<MetadataDTO<T>> {
    // eslint-disable-next-line unicorn/no-await-expression-member
    item = (
      await this.ServerMetadataModel.create(item)
    ).toObject() as MetadataDTO<T>;
    return item;
  }

  public async delete(state: MetadataDTO | string): Promise<boolean> {
    const query = this.merge(is.string(state) ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    delete query.deleted;
    const result = await this.ServerMetadataModel.updateOne(query, {
      deleted: Date.now(),
    }).exec();
    return result.acknowledged;
  }

  @CastResult(MetadataDTO)
  public async findById<T>(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<MetadataDTO<T>> {
    const query = this.merge(state, control);
    const out = await this.modifyQuery(
      control,
      this.ServerMetadataModel.findOne(query),
    )
      .lean()
      .exec();
    return out as MetadataDTO<T>;
  }

  @CastResult(MetadataDTO)
  public async findMany<T>(
    control: ResultControlDTO = {},
  ): Promise<MetadataDTO<T>[]> {
    const query = this.merge(control);
    const out = await this.modifyQuery(
      control,
      this.ServerMetadataModel.find(query),
    )
      .lean()
      .exec();
    return out as MetadataDTO<T>[];
  }

  public async save<T>(item: MetadataDTO<T>): Promise<MetadataDTO<T>> {
    if (item._id) {
      return await this.update(item, item._id);
    }
    return await this.create(item);
  }

  public async update<T>(
    state: Omit<Partial<MetadataDTO<T>>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<MetadataDTO<T>> {
    const query = this.merge(id);
    const result = await this.ServerMetadataModel.updateOne(
      query,
      state,
    ).exec();
    if (result.acknowledged) {
      return await this.findById<T>(id);
    }
  }
}
