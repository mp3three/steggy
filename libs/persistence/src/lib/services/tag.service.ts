import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { TagDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { TagDocument } from '../schema';

@Injectable()
export class TagService {
  // #region Constructors

  constructor(
    @InjectLogger(TagService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(TagDTO)
    private readonly myRoleModel: Model<TagDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(form: TagDTO): Promise<TagDTO> {
    return await this.myRoleModel.create(form);
  }

  @Trace()
  public async delete(role: TagDTO | string): Promise<boolean> {
    if (typeof role === 'object') {
      role = role._id;
    }
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
  public async findById(role: TagDTO | string): Promise<TagDTO> {
    if (typeof role === 'object') {
      role = role._id;
    }
    return await this.myRoleModel.findOne({
      _id: role,
      deleted: null,
    });
  }

  @Trace()
  public async findMany(
    query: Record<string, unknown> = {},
  ): Promise<TagDTO[]> {
    return await this.myRoleModel
      .find({
        deleted: null,
        ...query,
      })
      .exec();
  }

  @Trace()
  public async hardDelete(role: TagDTO | string): Promise<boolean> {
    if (typeof role === 'object') {
      role = role._id;
    }
    const result = await this.myRoleModel.deleteOne({
      _id: role,
    });
    return result.ok === 1;
  }

  @Trace()
  public async update(
    source: TagDTO | string,
    update: Omit<Partial<TagDTO>, '_id' | 'created'>,
  ): Promise<boolean> {
    if (typeof source === 'object') {
      source = source._id;
    }
    const result = await this.myRoleModel
      .updateOne({ _id: source, deleted: null }, update)
      .exec();
    return result.ok === 1;
  }

  // #endregion Public Methods
}
