import { ActionCRUD, CrudOptions } from '@automagical/contracts';
import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { ActionDTO } from '@automagical/contracts/formio-sdk';
import {
  HTTP_METHODS,
  ResultControlDTO,
} from '@automagical/contracts/utilities';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { FormioSdkService } from './formio-sdk.service';

@Injectable()
export class ActionService implements ActionCRUD {
  // #region Constructors

  constructor(
    @InjectLogger(ActionService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    protected readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(
    action: ActionDTO,
    options: CrudOptions,
  ): Promise<ActionDTO> {
    return await this.formioSdkService.fetch({
      ...(options.auth ?? {}),
      body: action,
      method: HTTP_METHODS.post,
      url: this.url(options),
    });
  }

  @Trace()
  public async delete(
    action: ActionDTO | string,
    options: CrudOptions,
  ): Promise<boolean> {
    return await this.formioSdkService.fetch({
      ...(options.auth ?? {}),
      method: HTTP_METHODS.delete,
      url: this.url(options, typeof action === 'string' ? action : action._id),
    });
  }

  @Trace()
  public async findById(
    action: string,
    options: CrudOptions,
  ): Promise<ActionDTO> {
    return await this.formioSdkService.fetch({
      ...(options.auth ?? {}),
      control: options.control,
      url: this.url(options, action),
    });
  }

  @Trace()
  public async findMany(
    control: ResultControlDTO,
    options: CrudOptions,
  ): Promise<ActionDTO[]> {
    return await this.formioSdkService.fetch({
      ...(options.auth ?? {}),
      control,
      url: this.url(options),
    });
  }

  @Trace()
  public async update(
    action: ActionDTO,
    options: CrudOptions,
  ): Promise<ActionDTO> {
    return await this.formioSdkService.fetch({
      ...(options.auth ?? {}),
      body: action,
      method: HTTP_METHODS.put,
      url: this.url(options, action._id),
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private url(options: CrudOptions, id?: string): string {
    let base = `/form/${options.form._id}/action`;
    if (id) {
      base = `${base}/${id}`;
    }
    return this.formioSdkService.projectUrl(options.project, base);
  }

  // #endregion Private Methods
}
