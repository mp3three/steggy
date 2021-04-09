import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { Injectable } from '@nestjs/common';
import { iProjectDriver } from '../../../typings/i-driver';

@Injectable()
export class MongoProjectDriver implements iProjectDriver {
  // #region Public Methods

  public async create(project: Partial<ProjectDTO>): Promise<ProjectDTO> {
    return null;
  }

  // #endregion Public Methods
}
