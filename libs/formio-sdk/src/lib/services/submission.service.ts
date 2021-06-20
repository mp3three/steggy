import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import type { FetchWith } from '@automagical/contracts/fetch';
import { HTTP_METHODS, ResultControlDTO } from '@automagical/contracts/fetch';
import {
  FormDTO,
  ProjectDTO,
  SubmissionDTO,
} from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { FormioSdkService } from './formio-sdk.service';

@Injectable()
export class SubmissionService {
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
    form: FormDTO,
    project: ProjectDTO,
    fetchArguments: FetchWith = {},
  ): Promise<T> {
    return await this.formioSdkService.fetch({
      ...fetchArguments,
      body: submission,
      method: HTTP_METHODS.post,
      url: this.buildUrl(undefined, form, project),
    });
  }

  @Trace()
  public async delete(
    submission: SubmissionDTO | string,
    form: FormDTO,
    project: ProjectDTO,
    fetchArguments: FetchWith = {},
  ): Promise<boolean> {
    return await this.formioSdkService.fetch({
      ...fetchArguments,
      method: HTTP_METHODS.delete,
      url: this.buildUrl(submission, form, project),
    });
  }

  @Trace()
  public async findById<T extends SubmissionDTO = SubmissionDTO>(
    submission: SubmissionDTO | string,
    form: FormDTO,
    project: ProjectDTO,
    fetchArguments: FetchWith = {},
  ): Promise<T> {
    return await this.formioSdkService.fetch({
      ...fetchArguments,
      url: this.buildUrl(submission, form, project),
    });
  }

  @Trace()
  public async findMany<T extends SubmissionDTO = SubmissionDTO>(
    query: ResultControlDTO,
    form: FormDTO,
    project: ProjectDTO,
    fetchArguments: FetchWith = {},
  ): Promise<T[]> {
    return await this.formioSdkService.fetch({
      ...fetchArguments,
      control: query,
      url: this.buildUrl(undefined, form, project),
    });
  }

  @Trace()
  public async findOne<T extends SubmissionDTO = SubmissionDTO>(
    query: ResultControlDTO,
    form: FormDTO,
    project: ProjectDTO,
    fetchArguments: FetchWith = {},
  ): Promise<T> {
    return (
      await this.formioSdkService.fetch<T[]>({
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
    form: FormDTO,
    project: ProjectDTO,
    update?: SubmissionDTO,
    fetchArguments: FetchWith = {},
  ): Promise<T> {
    return await this.formioSdkService.fetch({
      ...fetchArguments,
      body: update,
      method: HTTP_METHODS.put,
      url: this.buildUrl(source, form, project),
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private buildUrl(
    submission: SubmissionDTO | string,
    form: FormDTO,
    project: ProjectDTO,
  ): string {
    submission = typeof submission === 'string' ? submission : submission._id;
    const suffix = submission ? `/${submission}` : '';
    return this.formioSdkService.projectUrl(
      project._id,
      `/${this.formioSdkService.id(form._id)}/submission${suffix}`,
    );
  }

  // #endregion Private Methods
}
