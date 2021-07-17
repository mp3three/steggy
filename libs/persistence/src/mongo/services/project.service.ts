import { CrudOptions, ProjectCRUD } from '@automagical/contracts';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { EncryptionService } from '../../services/encryption.service';
import { ProjectDocument } from '../schema';
import { BaseMongoService } from './base-mongo.service';

@Injectable()
export class ProjectPersistenceMongoService
  extends BaseMongoService
  implements ProjectCRUD
{
  // #region Constructors

  constructor(
    @InjectLogger(ProjectPersistenceMongoService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(ProjectDTO)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public decrypt(
    project: ProjectDTO | ProjectDTO[],
  ): ProjectDTO | ProjectDTO[] {
    if (Array.isArray(project)) {
      return project.map((project) => this.decrypt(project) as ProjectDTO);
    }
    if (!project.settings_encrypted) {
      return project;
    }
    project = {
      ...project,
      settings: this.encryptionService.decrypt(project.settings_encrypted),
    };
    delete project.settings_encrypted;
    return project;
  }

  @Trace()
  public async delete(project: ProjectDTO | string): Promise<boolean> {
    const query = this.merge(
      typeof project === 'string' ? project : project._id,
    );
    this.logger.debug({ query }, `delete query`);
    const result = await this.projectModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public encrypt(project: ProjectDTO): ProjectDTO {
    if (!project.settings) {
      return project;
    }
    project = {
      ...project,
      settings_encrypted: this.encryptionService.encrypt(project.settings),
    };
    delete project.settings;
    return project;
  }

  @Trace()
  public async update(
    project: ProjectDTO,
    options: CrudOptions,
  ): Promise<ProjectDTO> {
    project = this.encrypt(project);
    const query = this.merge(options.control, options.project);
    query._id = query.project;
    delete query.project;
    this.logger.debug({ project, query }, `update query`);
    const result = await this.projectModel.updateOne(query, project).exec();
    if (result.ok === 1) {
      return await this.findById(project._id, options);
    }
  }

  @Trace()
  @ToClass(ProjectDTO)
  public async create(project: ProjectDTO): Promise<ProjectDTO> {
    return (await this.projectModel.create(this.encrypt(project))).toObject();
  }

  @Trace()
  @ToClass(ProjectDTO)
  public async findById(
    project: string,
    { control }: CrudOptions,
  ): Promise<ProjectDTO> {
    const query = this.merge(control, project);
    query._id = query.project;
    delete query.project;
    this.logger.debug({ query }, `findById query`);
    const found = await this.modifyQuery(
      control,
      this.projectModel.findOne(query),
    )
      .lean()
      .exec();
    if (!found) {
      return found;
    }
    return this.decrypt(found) as ProjectDTO;
  }

  @Trace()
  @ToClass(ProjectDTO)
  public async findByName(
    project: string,
    { control }: CrudOptions,
  ): Promise<ProjectDTO> {
    const query = this.merge(
      {
        filters: new Set([
          {
            field: 'name',
            value: project,
          },
        ]),
      },
      undefined,
      undefined,
      control,
    );
    this.logger.debug({ query }, `findByName query`);
    const found = await this.modifyQuery(
      control,
      this.projectModel.findOne(query),
    )
      .lean()
      .exec();
    if (!found) {
      return found;
    }
    return this.decrypt(found) as ProjectDTO;
  }

  @Trace()
  @ToClass(ProjectDTO)
  public async findMany(control: ResultControlDTO = {}): Promise<ProjectDTO[]> {
    const query = this.merge(control);
    this.logger.debug({ query }, `findMany query`);
    return this.decrypt(
      await this.modifyQuery(control, this.projectModel.find(query))
        .lean()
        .exec(),
    ) as ProjectDTO[];
  }

  // #endregion Public Methods
}
