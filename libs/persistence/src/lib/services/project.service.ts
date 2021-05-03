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

  // #endregion Public Methods
}
