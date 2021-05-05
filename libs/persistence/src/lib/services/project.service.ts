import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ProjectDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { ProjectDocument } from '../schema';

@Injectable()
export class ProjectService {
  // #region Constructors

  constructor(
    @InjectLogger(ProjectService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(ProjectDTO)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(
    project: ProjectDTO,
    owner?: UserDTO,
  ): Promise<ProjectDTO> {
    project.owner = project.owner || owner?._id;
    return await this.projectModel.create(project);
  }

  @Trace()
  public async delete(project: ProjectDTO | string): Promise<boolean> {
    if (typeof project === 'object') {
      project = project._id;
    }
    const result = await this.projectModel
      .updateOne(
        { _id: project },
        {
          deleted: Date.now(),
        },
      )
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async findById(project: ProjectDTO | string): Promise<ProjectDTO> {
    if (typeof project === 'object') {
      project = project._id;
    }
    return await this.projectModel.findOne({
      _id: project,
      deleted: null,
    });
  }

  @Trace()
  public async findByName(project: ProjectDTO | string): Promise<ProjectDTO> {
    if (typeof project === 'object') {
      project = project.name;
    }
    return await this.projectModel.findOne({
      deleted: null,
      name: project,
    });
  }

  @Trace()
  public async findMany(
    query: Record<string, unknown> = {},
  ): Promise<ProjectDTO[]> {
    return await this.projectModel
      .find({
        deleted: null,
        ...query,
      })
      .exec();
  }

  @Trace()
  public async hardDelete(project: ProjectDTO | string): Promise<boolean> {
    if (typeof project === 'object') {
      project = project._id;
    }
    const result = await this.projectModel.deleteOne({
      _id: project,
    });
    return result.ok === 1;
  }

  @Trace()
  public async update(
    source: ProjectDTO | string,
    update: Omit<Partial<ProjectDTO>, '_id' | 'created'>,
  ): Promise<boolean> {
    if (typeof source === 'object') {
      source = source._id;
    }
    const result = await this.projectModel
      .updateOne({ _id: source, deleted: null }, update)
      .exec();
    return result.ok === 1;
  }

  // #endregion Public Methods

  // #region Private Methods

  private async truncate() {
    await this.projectModel.deleteMany();
  }

  // #endregion Private Methods
}
