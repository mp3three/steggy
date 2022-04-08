import { HTTP_METHODS, is, ResultControlDTO } from '@steggy/utilities';
import { Injectable } from '@nestjs/common';

import { FormDTO, ProjectDTO, SDKCrudOptions } from '../contracts';
import { FormioFetchService } from './formio-fetch.service';

@Injectable()
export class FormService {
  constructor(private readonly formioSdkService: FormioFetchService) {}

  public async create(
    form: Readonly<FormDTO>,
    { auth }: SDKCrudOptions,
  ): Promise<FormDTO> {
    return await this.formioSdkService.fetch({
      body: form,
      method: HTTP_METHODS.post,
      url: this.url(form, form.project),
      ...auth,
    });
  }

  public async delete(
    form: Readonly<FormDTO>,
    { auth, project }: SDKCrudOptions,
  ): Promise<boolean> {
    return await this.formioSdkService.fetch({
      method: HTTP_METHODS.delete,
      url: this.url(form, project),
      ...auth,
    });
  }

  public async findById(
    form: FormDTO | string,
    { auth, project }: SDKCrudOptions,
  ): Promise<FormDTO> {
    return await this.formioSdkService.fetch({
      url: this.url(form, project),
      ...auth,
    });
  }

  public async findMany(
    query: ResultControlDTO,
    { auth, project }: SDKCrudOptions,
  ): Promise<FormDTO[]> {
    return await await this.formioSdkService.fetch({
      control: query,
      url: this.url('', project),
      ...auth,
    });
  }

  public async update(
    source: FormDTO,
    { auth, project }: SDKCrudOptions,
  ): Promise<FormDTO> {
    return await this.formioSdkService.fetch({
      body: source,
      method: HTTP_METHODS.put,
      url: this.url(source, project),
      ...auth,
    });
  }

  private url(form: FormDTO | string, project: ProjectDTO | string): string {
    form = is.string(form) ? form : form._id;
    project = is.string(project) ? project : project._id;
    return `/project/${project}/form/${form}`;
  }
}
