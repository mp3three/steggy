import { RoleCRUD } from '@automagical/contracts';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { ProjectDTO, RoleDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { RoleDocument } from '../schema';
import { BaseMongoService } from './base-mongo.service';

@Injectable()
export class RolePersistenceMongoService
  extends BaseMongoService
  implements RoleCRUD
{
  // #region Constructors

  constructor(
    @InjectLogger(RolePersistenceMongoService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(RoleDTO)
    private readonly myRoleModel: Model<RoleDocument>, // Don't judge me
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async delete(
    role: RoleDTO | string,
    project: ProjectDTO,
  ): Promise<boolean> {
    const result = await this.myRoleModel
      .updateOne(
        this.merge(typeof role === 'string' ? role : role._id, project),
        {
          deleted: Date.now(),
        },
      )
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update(source: RoleDTO, project: ProjectDTO): Promise<RoleDTO> {
    const result = await this.myRoleModel
      .updateOne(this.merge(source._id, project), source)
      .exec();
    if (result.ok === 1) {
      return await this.findById(source._id, project);
    }
  }

  @Trace()
  @ToClass(RoleDTO)
  public async create(form: RoleDTO): Promise<RoleDTO> {
    return (await this.myRoleModel.create(form)).toObject();
  }

  @Trace()
  @ToClass(RoleDTO)
  public async findById(
    role: string,
    project: ProjectDTO,
    control?: ResultControlDTO,
  ): Promise<RoleDTO> {
    return await this.modifyQuery(
      control,
      this.myRoleModel.findOne(this.merge(role, project, undefined, control)),
    )
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(RoleDTO)
  public async findMany(
    query: ResultControlDTO,
    project: ProjectDTO,
  ): Promise<RoleDTO[]> {
    return await this.modifyQuery(
      query,
      this.myRoleModel.find(this.merge(query, project)),
    )
      .lean()
      .exec();
  }

  // #endregion Public Methods
}
