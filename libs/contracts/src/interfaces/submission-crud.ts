import { ResultControlDTO } from '@automagical/contracts/fetch';
import {
  FormDTO,
  ProjectDTO,
  SubmissionDTO,
} from '@automagical/contracts/formio-sdk';

export interface SubmissionCRUD<
  CommonType extends SubmissionDTO = SubmissionDTO,
> {
  // #region Public Methods

  attach(project?: ProjectDTO, form?: FormDTO): void;
  create<RequestType extends CommonType = CommonType>(
    submission: RequestType,
    form?: FormDTO,
    project?: ProjectDTO,
  ): Promise<RequestType>;
  delete(
    submission: SubmissionDTO | string,
    form?: FormDTO,
    project?: ProjectDTO,
  ): Promise<boolean>;
  findById<RequestType extends CommonType = CommonType>(
    submission: string,
    form?: FormDTO,
    project?: ProjectDTO,
    control?: ResultControlDTO,
  ): Promise<RequestType>;
  findMany<RequestType extends CommonType = CommonType>(
    query: ResultControlDTO,
    form?: FormDTO,
    project?: ProjectDTO,
  ): Promise<RequestType[]>;
  findOne<RequestType extends CommonType = CommonType>(
    query: ResultControlDTO,
    form?: FormDTO,
    project?: ProjectDTO,
  ): Promise<RequestType>;
  update<RequestType extends CommonType = CommonType>(
    source: RequestType,
    form?: FormDTO,
    project?: ProjectDTO,
    update?: RequestType,
  ): Promise<RequestType>;

  // #endregion Public Methods
}
export const SubmissionCRUD = Symbol('SubmissionCRUD');
