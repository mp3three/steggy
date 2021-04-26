import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { ResourceDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { HTTP_Methods } from '../../typings';
import { FetchWith, IdentifierWithParent } from '../../typings/HTTP';
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
  public async delete(args: FetchWith<IdentifierWithParent>): Promise<unknown> {
    return await this.formioSdkService.fetch({
      url: this.buildResourcePath(args),
      method: HTTP_Methods.DELETE,
      ...args,
    });
  }

  @Trace()
  public async get(
    args: FetchWith<IdentifierWithParent>,
  ): Promise<ResourceDTO> {
    return await this.formioSdkService.fetch<ResourceDTO>({
      url: this.buildResourcePath(args),
      ...args,
    });
  }

  @Trace()
  public async list(
    args: FetchWith<IdentifierWithParent>,
  ): Promise<ResourceDTO[]> {
    return await this.formioSdkService.fetch<ResourceDTO[]>({
      url: this.buildResourcePath({ ...args, alias: 'form' }),
      ...args,
    });
  }

  @Trace()
  public async listVersions(
    args: FetchWith<IdentifierWithParent>,
  ): Promise<ResourceDTO[]> {
    return await this.formioSdkService.fetch<ResourceDTO[]>({
      url: this.buildResourcePath({ ...args, alias: 'form/v' }),
      ...args,
    });
  }

  @Trace()
  public async save(
    args: FetchWith<IdentifierWithParent>,
  ): Promise<ResourceDTO> {
    return await this.formioSdkService.fetch({
      url: this.buildResourcePath(args),
      method: HTTP_Methods[args._id ? 'PUT' : 'POST'],
      ...args,
    });
  }

  public buildResourcePath(
    args: FetchWith<IdentifierWithParent & { alias?: string }>,
  ): string {
    const url = [''];
    if (args.parent) {
      url.push(args.parent);
    }
    url.push(args.name || args._id);
    if (args.alias) {
      url.push(args.alias);
    }
    return url.join('/');
  }

  // #endregion Public Methods
}
