import { AutoLogService, CastResult } from '@automagical/boilerplate';
import { BaseMongoService, BaseSchemaDTO } from '@automagical/persistence';
import { is, ResultControlDTO } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MetadataDocument, MetadataDTO } from '../../contracts';

@Injectable()
export class ServerMetadataPersistenceService extends BaseMongoService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectModel(MetadataDTO.name)
    private readonly ServerMetadataModel: Model<MetadataDocument>,
  ) {
    super();
  }

  @CastResult(MetadataDTO)
  public async create(
    item: Omit<MetadataDTO, keyof BaseSchemaDTO>,
  ): Promise<MetadataDTO> {
    // eslint-disable-next-line unicorn/no-await-expression-member
    item = (await this.ServerMetadataModel.create(item)).toObject();
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
  public async findById(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<MetadataDTO> {
    const query = this.merge(state, control);
    const out = await this.modifyQuery(
      control,
      this.ServerMetadataModel.findOne(query),
    )
      .lean()
      .exec();
    return out;
  }

  @CastResult(MetadataDTO)
  public async findMany(
    control: ResultControlDTO = {},
  ): Promise<MetadataDTO[]> {
    const query = this.merge(control);
    const out = await this.modifyQuery(
      control,
      this.ServerMetadataModel.find(query),
    )
      .lean()
      .exec();
    return out;
  }

  public async save(item: MetadataDTO): Promise<MetadataDTO> {
    if (item._id) {
      return await this.update(item, item._id);
    }
    return await this.create(item);
  }

  public async update(
    state: Omit<Partial<MetadataDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<MetadataDTO> {
    const query = this.merge(id);
    const result = await this.ServerMetadataModel.updateOne(
      query,
      state,
    ).exec();
    if (result.acknowledged) {
      return await this.findById(id);
    }
  }
}
