import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { FormioSdkService } from './formio-sdk.service';
import { FetchWith, IdentifierWithParent } from '../../typings/HTTP';
import { HTTP_Methods } from '../../typings';
import { ResourceDTO } from '@automagical/contracts/formio-sdk';

@Injectable()
export class ResourceService {
  // #region Constructors

  constructor(
    @InjectPinoLogger(ResourceService.name)
    protected readonly logger: PinoLogger,
    @Inject(forwardRef(() => FormioSdkService))
    public readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public buildResourcePath(
    args: FetchWith<IdentifierWithParent & { alias?: string }>,
  ) {
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

  public async delete(args: FetchWith<IdentifierWithParent>) {
    this.logger.debug(`delete`, args);
    return this.formioSdkService.fetch({
      url: this.buildResourcePath(args),
      method: HTTP_Methods.DELETE,
      ...args,
    });
  }

  public async get(args: FetchWith<IdentifierWithParent>) {
    this.logger.debug(`get`, args);
    return this.formioSdkService.fetch<ResourceDTO>({
      url: this.buildResourcePath(args),
      ...args,
    });
  }

  public async list(args: FetchWith<IdentifierWithParent>) {
    this.logger.debug(`list`, args);
    return this.formioSdkService.fetch<ResourceDTO[]>({
      url: this.buildResourcePath({ ...args, alias: 'form' }),
      ...args,
    });
  }

  public async listVersions(args: FetchWith<IdentifierWithParent>) {
    this.logger.debug(`listVersions`, args);
    return this.formioSdkService.fetch<ResourceDTO[]>({
      url: this.buildResourcePath({ ...args, alias: 'form/v' }),
      ...args,
    });
  }

  public async save(args: FetchWith<IdentifierWithParent>) {
    this.logger.debug(`save`, args);
    return this.formioSdkService.fetch({
      url: this.buildResourcePath(args),
      method: HTTP_Methods[args._id ? 'PUT' : 'POST'],
      ...args,
    });
  }

  // #endregion Public Methods
}
