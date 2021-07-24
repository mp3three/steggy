import { CrudOptions } from '@automagical/contracts';
import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { FormDTO, ProjectDTO } from '@automagical/contracts/formio-sdk';
import {
  HTTP_METHODS,
  ResultControlDTO,
} from '@automagical/contracts/utilities';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { FormioSdkService } from './formio-sdk.service';

@Injectable()
export class FormService {
  // #region Constructors

  constructor(
    @InjectLogger(FormService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    private readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(
    form: Readonly<FormDTO>,
    { auth, project }: CrudOptions,
  ): Promise<FormDTO> {
    return await this.formioSdkService.fetch({
      body: form,
      method: HTTP_METHODS.post,
      url: this.url(form, project),
      ...auth,
    });
  }

  @Trace()
  public async delete(
    form: Readonly<FormDTO>,
    { auth, project }: CrudOptions,
  ): Promise<boolean> {
    return await this.formioSdkService.fetch({
      method: HTTP_METHODS.delete,
      url: this.url(form, project),
      ...auth,
    });
  }

  @Trace()
  public async findById(
    form: FormDTO | string,
    { auth, project, control }: CrudOptions,
  ): Promise<FormDTO> {
    return await this.formioSdkService.fetch({
      control,
      url: this.url(form, project),
      ...auth,
    });
  }

  @Trace()
  public async findByName(
    form: string,
    { auth, project, control }: CrudOptions,
  ): Promise<FormDTO> {
    return await this.formioSdkService.fetch({
      ...auth,
      control,
      url: this.url(form, project, true),
    });
  }

  @Trace()
  public async findMany(
    query: ResultControlDTO,
    { auth, project }: CrudOptions,
  ): Promise<FormDTO[]> {
    return await await this.formioSdkService.fetch({
      ...auth,
      control: query,
      url: this.url('', project),
    });
  }

  @Trace()
  public async update(
    source: FormDTO,
    { auth, project }: CrudOptions,
  ): Promise<FormDTO> {
    return await this.formioSdkService.fetch({
      body: source,
      method: HTTP_METHODS.put,
      url: this.url(source, project),
      ...auth,
    });
  }

  public url(
    form: FormDTO | string,
    project?: ProjectDTO | string,
    name = false,
  ): string {
    form = typeof form === 'string' ? form : form._id;
    form ??= '';
    form = form.length > 0 ? `/${form}` : '';
    return this.formioSdkService.projectUrl(
      project,
      `${name ? '' : '/form'}${form}`,
    );
  }

  // #endregion Public Methods
}
