import { FormCRUD } from '@automagical/contracts';
import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { HTTP_METHODS, ResultControlDTO } from '@automagical/contracts/fetch';
import { FormDTO, ProjectDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { FormioSdkService } from './formio-sdk.service';

@Injectable()
export class FormService implements FormCRUD {
  // #region Constructors

  constructor(
    @InjectLogger(FormService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    private readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(form: Readonly<FormDTO>): Promise<FormDTO> {
    return await this.formioSdkService.fetch({
      body: form,
      method: HTTP_METHODS.post,
      url: this.url(form),
    });
  }

  @Trace()
  public async delete(
    form: Readonly<FormDTO>,
    project?: Readonly<ProjectDTO>,
  ): Promise<boolean> {
    return await this.formioSdkService.fetch({
      method: HTTP_METHODS.delete,
      url: this.url(form, project),
    });
  }

  @Trace()
  public async findById(
    form: FormDTO | string,
    project?: ProjectDTO | string,
  ): Promise<FormDTO> {
    return await this.formioSdkService.fetch({
      url: this.url(form, project),
    });
  }

  @Trace()
  public async findByName(
    form: string,
    project?: ProjectDTO,
  ): Promise<FormDTO> {
    const results = await this.findMany(
      {
        filters: new Set([
          {
            field: 'name',
            value: form,
          },
        ]),
      },
      project,
    );
    return results[0];
  }

  @Trace()
  public async findMany(
    query: ResultControlDTO,
    project?: ProjectDTO | string,
  ): Promise<FormDTO[]> {
    return await await this.formioSdkService.fetch({
      control: query,
      url: this.url('', project),
    });
  }

  @Trace()
  public async update(
    source: FormDTO,
    project?: ProjectDTO | string,
  ): Promise<FormDTO> {
    return await this.formioSdkService.fetch({
      body: source,
      method: HTTP_METHODS.put,
      url: this.url(source, project),
    });
  }

  public async hardDelete(): Promise<never> {
    throw new InternalServerErrorException();
  }

  // #endregion Public Methods

  // #region Private Methods

  private url(form: FormDTO | string, project?: ProjectDTO | string): string {
    project =
      (typeof project === 'string' ? project : project._id) ||
      (form as FormDTO).project;
    if (typeof form === 'string') {
      return `/project/${project}/form/${form}`;
    }
    return `/project/${form.project}/form/${form._id || ''}`;
  }

  // #endregion Private Methods
}
