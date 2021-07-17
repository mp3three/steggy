import { CrudOptions } from '../interfaces/crud-options';
import { ResultControlDTO } from '../libs/fetch';
import { FormDTO, ProjectDTO, SubmissionDTO } from '../libs/formio-sdk';

export interface SubmissionCRUD<
  CommonType extends SubmissionDTO = SubmissionDTO,
> {
  // #region Public Methods

  attach(project?: ProjectDTO, form?: FormDTO): void;
  create<RequestType extends CommonType = CommonType>(
    submission: RequestType,
    options: CrudOptions,
  ): Promise<RequestType>;
  delete(
    submission: SubmissionDTO | string,
    options: CrudOptions,
  ): Promise<boolean>;
  findById<RequestType extends CommonType = CommonType>(
    submission: string,
    options: CrudOptions,
  ): Promise<RequestType>;
  findMany<RequestType extends CommonType = CommonType>(
    query: ResultControlDTO,
    options: CrudOptions,
  ): Promise<RequestType[]>;
  findOne<RequestType extends CommonType = CommonType>(
    query: ResultControlDTO,
    options: CrudOptions,
  ): Promise<RequestType>;
  update<RequestType extends CommonType = CommonType>(
    source: RequestType,
    options: CrudOptions,
  ): Promise<RequestType>;

  // #endregion Public Methods
}
export const SubmissionCRUD = Symbol('SubmissionCRUD');
export type iSubmissionCRUD = SubmissionCRUD;
