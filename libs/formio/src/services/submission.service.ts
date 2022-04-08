import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  FetchWith,
  HTTP_METHODS,
  is,
  ResultControlDTO,
} from '@steggy/utilities';

import { FormDTO, SDKCrudOptions, SubmissionDTO } from '../contracts';
import { FormioFetchService } from './formio-fetch.service';

@Injectable()
export class SubmissionService {
  constructor(
    protected readonly logger: AutoLogService,
    private readonly formioSdkService: FormioFetchService,
  ) {}

  public async create<T extends SubmissionDTO = SubmissionDTO>(
    submission: SubmissionDTO,
    { form, auth }: SDKCrudOptions,
    fetchArguments: FetchWith = {},
  ): Promise<T> {
    return await this.formioSdkService.fetch({
      ...auth,
      ...fetchArguments,
      body: submission,
      method: HTTP_METHODS.post,
      url: this.buildUrl(undefined, form),
    });
  }

  public async delete(
    submission: SubmissionDTO | string,
    { form, auth }: SDKCrudOptions,
    fetchArguments: FetchWith = {},
  ): Promise<boolean> {
    return await this.formioSdkService.fetch({
      ...auth,
      ...fetchArguments,
      method: HTTP_METHODS.delete,
      url: this.buildUrl(submission, form),
    });
  }

  public async findById<T extends SubmissionDTO = SubmissionDTO>(
    submission: SubmissionDTO | string,
    { form, auth }: SDKCrudOptions,
    fetchArguments: FetchWith = {},
  ): Promise<T> {
    return await this.formioSdkService.fetch({
      ...auth,
      ...fetchArguments,
      url: this.buildUrl(submission, form),
    });
  }

  public async findMany<T extends SubmissionDTO = SubmissionDTO>(
    query: ResultControlDTO,
    { form, auth }: SDKCrudOptions,
    fetchArguments: FetchWith = {},
  ): Promise<T[]> {
    return await this.formioSdkService.fetch({
      ...auth,
      ...fetchArguments,
      control: query,
      url: this.buildUrl(undefined, form),
    });
  }

  public async findOne<T extends SubmissionDTO = SubmissionDTO>(
    query: ResultControlDTO,
    { form, auth }: SDKCrudOptions,
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
        url: this.buildUrl(undefined, form),
      })
    ).shift();
  }

  public async update<T extends SubmissionDTO = SubmissionDTO>(
    source: SubmissionDTO | string,
    { form, auth }: SDKCrudOptions,
    update?: SubmissionDTO,
    fetchArguments: FetchWith = {},
  ): Promise<T> {
    return await this.formioSdkService.fetch({
      ...auth,
      ...fetchArguments,
      body: update,
      method: HTTP_METHODS.put,
      url: this.buildUrl(source, form),
    });
  }

  private buildUrl(submission: SubmissionDTO | string, form: FormDTO): string {
    submission = is.string(submission) ? submission : submission._id;
    const suffix = submission ? `/${submission}` : '';
    return `/${form._id}/submission${suffix}`;
  }
}
