import { ProjectDTO } from '@automagical/contracts/formio-sdk';

export interface iProjectDriver {
  // #region Public Methods

  create(project: Partial<ProjectDTO>): Promise<ProjectDTO>;

  // #endregion Public Methods
}
