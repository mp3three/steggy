import type { ResultControlDTO } from '@automagical/contracts/fetch';
import type { ProjectDTO } from '@automagical/contracts/formio-sdk';

export interface ProjectCRUD {
  // #region Public Methods

  create(project: ProjectDTO, ...extra: unknown[]): Promise<ProjectDTO>;
  delete(project: ProjectDTO | string, ...extra: unknown[]): Promise<boolean>;
  findById(
    project: string,
    control?: ResultControlDTO,
    ...extra: unknown[]
  ): Promise<ProjectDTO>;
  findByName(
    project: string,
    control?: ResultControlDTO,
    ...extra: unknown[]
  ): Promise<ProjectDTO>;
  findMany(query: ResultControlDTO, ...extra: unknown[]): Promise<ProjectDTO[]>;
  update(source: ProjectDTO, ...extra: unknown[]): Promise<ProjectDTO>;

  // #endregion Public Methods
}
export const ProjectCRUD = Symbol('ProjectCRUD');
