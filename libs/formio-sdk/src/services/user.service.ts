import { CrudOptions, FormCRUD, SubmissionCRUD } from '@automagical/contracts';
import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import {
  FormDTO,
  PORTAL_RESOURCES,
  UserDTO,
} from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { FormioSdkService } from './formio-sdk.service';

@Injectable()
export class UserService {
  // #region Object Properties

  private form: FormDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(UserService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    @Inject(SubmissionCRUD) private readonly submissionCrud: SubmissionCRUD,
    @Inject(FormCRUD) private readonly formCrud: FormCRUD,
    private readonly formioSDK: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(user: UserDTO, options: CrudOptions): Promise<UserDTO> {
    return await this.submissionCrud.create(user, options);
  }

  @Trace()
  public async findByEmail(
    user: UserDTO | string,
    options: CrudOptions,
  ): Promise<UserDTO> {
    user = typeof user === 'string' ? user : user._id;
    return (
      await this.submissionCrud.findMany<UserDTO>(
        {
          filters: new Set([{ field: 'data.email', value: user }]),
        },
        options,
      )
    )[0];
  }

  @Trace()
  public async findById(
    user: UserDTO | string,
    options: CrudOptions,
  ): Promise<UserDTO> {
    user = typeof user === 'string' ? user : user._id;
    return await this.submissionCrud.findById<UserDTO>(user, options);
  }

  @Trace()
  public async roleAdd(
    user: UserDTO | string,
    role: string,
    options: CrudOptions,
  ): Promise<UserDTO> {
    user = typeof user === 'string' ? await this.findById(user, options) : user;
    user.roles ??= [];
    user.roles.push(role);
    return await this.update(user, options);
  }

  @Trace()
  public async roleRemove(
    user: UserDTO | string,
    role: string,
    options: CrudOptions,
  ): Promise<UserDTO> {
    user = typeof user === 'string' ? await this.findById(user, options) : user;
    user.roles ??= [];
    user.roles = user.roles.filter((item) => item !== role);
    return await this.update(user, options);
  }

  @Trace()
  public async update(user: UserDTO, options: CrudOptions): Promise<UserDTO> {
    return await this.submissionCrud.update(user, options);
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private async onModuleInit() {
    if (!this.formioSDK.BASE_PROJECT) {
      return;
    }
    this.form = await this.formCrud.findByName(PORTAL_RESOURCES.user, {
      project: this.formioSDK.BASE_PROJECT,
    });
    if (typeof this.form === 'string') {
      this.logger.warn(`Failed to load team data`);
      return;
    }
    this.submissionCrud.attach(this.formioSDK.BASE_PROJECT, this.form);
  }

  // #endregion Private Methods
}
