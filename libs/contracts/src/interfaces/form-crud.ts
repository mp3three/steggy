import { ResultControlDTO } from '@automagical/contracts/fetch';
import { FormDTO, ProjectDTO } from '@automagical/contracts/formio-sdk';

export interface FormCRUD {
  // #region Public Methods

  create(form: FormDTO, project: ProjectDTO): Promise<FormDTO>;
  delete(form: FormDTO | string, project: ProjectDTO): Promise<boolean>;
  findById(
    form: string,
    project: ProjectDTO,
    control?: ResultControlDTO,
  ): Promise<FormDTO>;
  findByName(
    form: string,
    project: ProjectDTO,
    control?: ResultControlDTO,
  ): Promise<FormDTO>;
  findMany(query: ResultControlDTO, project?: ProjectDTO): Promise<FormDTO[]>;
  update(form: FormDTO, project: ProjectDTO): Promise<FormDTO>;

  // #endregion Public Methods
}
export const FormCRUD = Symbol('FormCRUD');
