import { CrudOptions, SubmissionCRUD } from '@formio/contracts';
import { LIB_FORMIO_SDK } from '@formio/contracts/constants';
import type { FetchWith } from '@formio/contracts/fetch';
import { HTTP_METHODS, ResultControlDTO } from '@formio/contracts/fetch';
import {
  FormDTO,
  ProjectDTO,
  SubmissionDTO,
} from '@formio/contracts/formio-sdk';
import { InjectLogger, Trace } from '@formio/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { FormioSdkService } from './formio-sdk.service';

@Injectable()
export class SubmissionService implements SubmissionCRUD {
  // #region Object Properties

  private form?: FormDTO;
  private project?: ProjectDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(SubmissionService, LIB_FORMIO_SDK)
    protected readonly logger: PinoLogger,
    private readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create<T extends SubmissionDTO = SubmissionDTO>(
    submission: SubmissionDTO,
    { form, project, auth }: CrudOptions,
    fetchArguments: FetchWith = {},
  ): Promise<T> {
    return await this.formioSdkService.fetch({
      ...auth,
      ...fetchArguments,
      body: submission,
      method: HTTP_METHODS.post,
      url: this.buildUrl(undefined, form, project),
    });
  }

  @Trace()
  public async delete(
    submission: SubmissionDTO | string,
    { form, project, auth }: CrudOptions,
    fetchArguments: FetchWith = {},
  ): Promise<boolean> {
    return await this.formioSdkService.fetch({
      ...auth,
      ...fetchArguments,
      method: HTTP_METHODS.delete,
      url: this.buildUrl(submission, form, project),
    });
  }

  @Trace()
  public async findById<T extends SubmissionDTO = SubmissionDTO>(
    submission: SubmissionDTO | string,
    { form, project, auth }: CrudOptions,
    fetchArguments: FetchWith = {},
  ): Promise<T> {
    return await this.formioSdkService.fetch({
      ...auth,
      ...fetchArguments,
      url: this.buildUrl(submission, form, project),
    });
  }

  @Trace()
  public async findMany<T extends SubmissionDTO = SubmissionDTO>(
    query: ResultControlDTO,
    { form, project, auth }: CrudOptions,
    fetchArguments: FetchWith = {},
  ): Promise<T[]> {
    return await this.formioSdkService.fetch({
      ...auth,
      ...fetchArguments,
      control: query,
      url: this.buildUrl(undefined, form, project),
    });
  }

  @Trace()
  public async findOne<T extends SubmissionDTO = SubmissionDTO>(
    query: ResultControlDTO,
    { form, project, auth }: CrudOptions,
    fetchArguments: FetchWith = {},
  ): Promise<T> {
    return (
      await this.formioSdkService.fetch<T[]>({
        ...auth,
        ...fetchArguments,
        control: {
          limit: 1,
          ...query,
        },
        url: this.buildUrl(undefined, form, project),
      })
    ).shift();
  }

  @Trace()
  public async update<T extends SubmissionDTO = SubmissionDTO>(
    source: SubmissionDTO | string,
    { form, project, auth }: CrudOptions,
    update?: SubmissionDTO,
    fetchArguments: FetchWith = {},
  ): Promise<T> {
    return await this.formioSdkService.fetch({
      ...auth,
      ...fetchArguments,
      body: update,
      method: HTTP_METHODS.put,
      url: this.buildUrl(source, form, project),
    });
  }

  public attach(project?: ProjectDTO, form?: FormDTO): void {
    this.project = project;
    this.form = form;
  }

  // #endregion Public Methods

  // #region Private Methods

  private buildUrl(
    submission: SubmissionDTO | string,
    form: FormDTO,
    project?: ProjectDTO | string,
  ): string {
    project ??= this.project;
    form ??= this.form;
    project = typeof project === 'string' ? project : project?._id;
    submission = typeof submission === 'string' ? submission : submission?._id;
    const suffix = submission ? `/${submission}` : '';
    return this.formioSdkService.projectUrl(
      project,
      `/form/${this.formioSdkService.id(form._id)}/submission${suffix}`,
    );
  }

  // #endregion Private Methods
}
