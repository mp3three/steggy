import { LIB_PERSISTENCE } from '@formio/contracts/constants';
import { TagDTO } from '@formio/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@formio/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { TagDocument } from '../schema';

@Injectable()
export class TagPersistenceMongoService {
  // #region Constructors

  constructor(
    @InjectLogger(TagPersistenceMongoService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(TagDTO)
    private readonly myRoleModel: Model<TagDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async delete(role: TagDTO): Promise<boolean> {
    const result = await this.myRoleModel
      .updateOne(
        { _id: role },
        {
          deleted: Date.now(),
        },
      )
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update(
    source: TagDTO | string,
    update: Omit<Partial<TagDTO>, '_id' | 'created'>,
  ): Promise<TagDTO> {
    if (typeof source === 'object') {
      source = source._id;
    }
    const result = await this.myRoleModel
      .updateOne({ _id: source, deleted: null }, update)
      .exec();
    if (result.ok === 1) {
      return await this.findById(source);
    }
  }

  @Trace()
  @ToClass(TagDTO)
  public async create(form: TagDTO): Promise<TagDTO> {
    return (await this.myRoleModel.create(form)).toObject();
  }

  @Trace()
  @ToClass(TagDTO)
  public async findById(role: TagDTO | string): Promise<TagDTO> {
    if (typeof role === 'object') {
      role = role._id;
    }
    return await this.myRoleModel
      .findOne({
        _id: role,
        deleted: null,
      })
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(TagDTO)
  public async findMany(
    query: Record<string, unknown> = {},
  ): Promise<TagDTO[]> {
    return await this.myRoleModel
      .find({
        deleted: null,
        ...query,
      })
      .lean()
      .exec();
  }

  // #endregion Public Methods
}
