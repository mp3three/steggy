import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MongoProjectDriver {
  // #region Public Methods

  public async create(project: Partial<ProjectDTO>): Promise<ProjectDTO> {
    project;
    return null;
  }

  // #endregion Public Methods
}
