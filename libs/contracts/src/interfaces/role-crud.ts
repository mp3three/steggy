import { ResultControlDTO } from '@automagical/contracts/fetch';
import { ProjectDTO, RoleDTO } from '@automagical/contracts/formio-sdk';

export interface RoleCRUD {
  // #region Public Methods

  create(form: RoleDTO, project: ProjectDTO): Promise<RoleDTO>;
  delete(form: RoleDTO | string, project: ProjectDTO): Promise<boolean>;
  findById(
    role: string,
    project: ProjectDTO,
    control?: ResultControlDTO,
  ): Promise<RoleDTO>;
  findMany(query: ResultControlDTO, project: ProjectDTO): Promise<RoleDTO[]>;
  update(source: RoleDTO, project: ProjectDTO): Promise<RoleDTO>;

  // #endregion Public Methods
}
export const RoleCRUD = Symbol('RoleCRUD');
