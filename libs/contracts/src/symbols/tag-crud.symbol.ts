import { ResultControlDTO } from '../libs/fetch';
import { FormDTO, ProjectDTO, TagDTO } from '../libs/formio-sdk';

export interface TagCRUD {
  // #region Public Methods

  create<T extends TagDTO = TagDTO>(
    Tag: T,
    form: FormDTO,
    project: ProjectDTO,
  ): Promise<T>;
  delete(
    Tag: TagDTO | string,
    form: FormDTO,
    project: ProjectDTO,
  ): Promise<boolean>;
  findById<T extends TagDTO = TagDTO>(
    Tag: string,
    form: FormDTO,
    project: ProjectDTO,
    control: ResultControlDTO,
  ): Promise<T>;
  findMany<T extends TagDTO = TagDTO>(
    query: ResultControlDTO,
    form: FormDTO,
    project: ProjectDTO,
  ): Promise<T[]>;
  update<T extends TagDTO = TagDTO>(
    source: T,
    form: FormDTO,
    project: ProjectDTO,
    update?: T,
  ): Promise<T>;

  // #endregion Public Methods
}
export const TagCRUD = Symbol('TagCRUD');
export type iTagCRUD = TagCRUD;
