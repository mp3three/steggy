import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { RoleDTO } from '@automagical/contracts/formio-sdk';
import { RoleDocument } from '@automagical/persistence';
import { InjectLogger, InjectMongo, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RoleService {
  // #region Constructors

  constructor(
    @InjectLogger(RoleService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(RoleDTO)
    private readonly myRoleModel: Model<RoleDocument>, // Don't judge me
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(form: RoleDTO): Promise<RoleDTO> {
    return await this.myRoleModel.create(form);
  }

  @Trace()
  public async delete(role: RoleDTO | string): Promise<boolean> {
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
  public async findById(role: RoleDTO | string): Promise<RoleDTO> {
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
  ): Promise<RoleDTO[]> {
    return await this.myRoleModel
      .find({
        deleted: null,
        ...query,
      })
      .exec();
  }

  @Trace()
  public async hardDelete(role: RoleDTO | string): Promise<boolean> {
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
    source: RoleDTO | string,
    update: Omit<Partial<RoleDTO>, '_id' | 'created'>,
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
