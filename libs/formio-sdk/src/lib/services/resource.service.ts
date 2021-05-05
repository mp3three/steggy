import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { ResourceDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { FetchWith, HTTP_Methods, IdentifierWithParent } from '../../typings';
import { FormioSdkService } from './formio-sdk.service';

@Injectable()
export class ResourceService {
  // #region Constructors

  constructor(
    @InjectLogger(ResourceService, LIB_FORMIO_SDK)
    protected readonly logger: PinoLogger,
    @Inject(forwardRef(() => FormioSdkService))
    public readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async delete(
    arguments_: FetchWith<IdentifierWithParent>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      method: HTTP_Methods.DELETE,
      url: this.buildResourcePath(arguments_),
      ...arguments_,
    });
  }

  @Trace()
  public async get(
    arguments_: FetchWith<IdentifierWithParent>,
  ): Promise<ResourceDTO> {
    return await this.formioSdkService.fetch<ResourceDTO>({
      url: this.buildResourcePath(arguments_),
      ...arguments_,
    });
  }

  @Trace()
  public async list(
    arguments_: FetchWith<IdentifierWithParent>,
  ): Promise<ResourceDTO[]> {
    return await this.formioSdkService.fetch<ResourceDTO[]>({
      url: this.buildResourcePath({ ...arguments_, alias: 'form' }),
      ...arguments_,
    });
  }

  @Trace()
  public async listVersions(
    arguments_: FetchWith<IdentifierWithParent>,
  ): Promise<ResourceDTO[]> {
    return await this.formioSdkService.fetch<ResourceDTO[]>({
      url: this.buildResourcePath({ ...arguments_, alias: 'form/v' }),
      ...arguments_,
    });
  }

  @Trace()
  public async save(
    arguments_: FetchWith<IdentifierWithParent>,
  ): Promise<ResourceDTO> {
    return await this.formioSdkService.fetch({
      method: HTTP_Methods[arguments_._id ? 'PUT' : 'POST'],
      url: this.buildResourcePath(arguments_),
      ...arguments_,
    });
  }

  public buildResourcePath(
    arguments_: FetchWith<IdentifierWithParent & { alias?: string }>,
  ): string {
    const url = [''];
    if (arguments_.parent) {
      url.push(arguments_.parent);
    }
    url.push(arguments_.name || arguments_._id);
    if (arguments_.alias) {
      url.push(arguments_.alias);
    }
    return url.join('/');
  }

  // #endregion Public Methods
}
