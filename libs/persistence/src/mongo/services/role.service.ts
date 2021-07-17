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
    const query = this.merge(
      typeof role === 'string' ? role : role._id,
      project,
    );
    this.logger.debug({ query }, `delete query`);
    const result = await this.myRoleModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update(role: RoleDTO, project: ProjectDTO): Promise<RoleDTO> {
    const query = this.merge(role._id, project);
    this.logger.debug({ query, role }, `update query`);
    const result = await this.myRoleModel.updateOne(query, role).exec();
    if (result.ok === 1) {
      return await this.findById(role._id, project);
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
    const query = this.merge(role, project, undefined, control);
    this.logger.debug({ query }, `findById query`);
    return await this.modifyQuery(control, this.myRoleModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(RoleDTO)
  public async findMany(
    control: ResultControlDTO,
    project: ProjectDTO,
  ): Promise<RoleDTO[]> {
    const query = this.merge(control, project);
    this.logger.debug({ query }, `findMany query`);
    return await this.modifyQuery(query, this.myRoleModel.find(query))
      .lean()
      .exec();
  }

  // #endregion Public Methods
}
