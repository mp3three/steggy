import { CrudOptions } from '../interfaces/crud-options';
import { ProjectDTO } from '../libs/formio-sdk/project.dto';
import { ProjectExportDetailsDTO } from '../libs/server/project-export-details.dto';

export interface ProjectSupport {
  // #region Public Methods

  access(options: CrudOptions): Promise<unknown>;
  adminCreate(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown>;
  adminLogin(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown>;
  available(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown>;
  deploy(data: Record<string, unknown>, options: CrudOptions): Promise<unknown>;
  export(
    project: ProjectDTO,
    options: CrudOptions,
  ): Promise<ProjectExportDetailsDTO>;
  getCurrentTag(project: ProjectDTO, options: CrudOptions): Promise<unknown>;
  import(data: Record<string, unknown>, options: CrudOptions): Promise<unknown>;
  portalCheck(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown>;
  report(data: Record<string, unknown>, options: CrudOptions): Promise<unknown>;
  sqlconnector(project: ProjectDTO, options: CrudOptions): Promise<unknown>;
  swagger(project: ProjectDTO, options: CrudOptions): Promise<unknown>;
  tempAuthToken(project: ProjectDTO, options: CrudOptions): Promise<unknown>;
  upgradeProject(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown>;

  // #endregion Public Methods
}
export const ProjectSupport = Symbol('ProjectSupport');
export type iProjectSupport = ProjectSupport;
