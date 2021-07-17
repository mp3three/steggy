import { CrudOptions } from '../interfaces/crud-options';
import { ResultControlDTO } from '../libs/fetch';
import { ProjectDTO } from '../libs/formio-sdk';

export interface ProjectCRUD {
  // #region Public Methods

  create(project: ProjectDTO, options: CrudOptions): Promise<ProjectDTO>;
  delete(project: ProjectDTO | string, options: CrudOptions): Promise<boolean>;
  findById(project: string, options: CrudOptions): Promise<ProjectDTO>;
  findByName(project: string, options: CrudOptions): Promise<ProjectDTO>;
  findMany(
    query: ResultControlDTO,
    options: CrudOptions,
  ): Promise<ProjectDTO[]>;
  update(source: ProjectDTO, options: CrudOptions): Promise<ProjectDTO>;

  // #endregion Public Methods
}
export const ProjectCRUD = Symbol('ProjectCRUD');
export type iProjectCRUD = ProjectCRUD;
