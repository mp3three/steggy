import { ProjectCRUD } from '@automagical/contracts';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { ProjectDocument } from '../schema';
import { BaseMongoService } from './base-mongo.service';
import { EncryptionService } from './encryption.service';

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
    const result = await this.projectModel
      .updateOne(
        this.merge(typeof project === 'string' ? project : project._id),
        {
          deleted: Date.now(),
        },
      )
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
  public async update(project: ProjectDTO): Promise<ProjectDTO> {
    const result = await this.projectModel
      .updateOne(this.merge(project._id), this.encrypt(project))
      .exec();
    if (result.ok === 1) {
      return await this.findById(project._id);
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
    control?: ResultControlDTO,
  ): Promise<ProjectDTO> {
    const found = await this.modifyQuery(
      control,
      this.projectModel.findOne(this.merge(control, project)),
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
    control?: ResultControlDTO,
  ): Promise<ProjectDTO> {
    const found = await this.modifyQuery(
      control,
      this.projectModel.findOne(
        this.merge(
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
        ),
      ),
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
  public async findMany(query: ResultControlDTO = {}): Promise<ProjectDTO[]> {
    return this.decrypt(
      await this.modifyQuery(query, this.projectModel.find(this.merge(query)))
        .lean()
        .exec(),
    ) as ProjectDTO[];
  }

  // #endregion Public Methods
}
