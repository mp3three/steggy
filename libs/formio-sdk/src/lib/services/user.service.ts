import { FormCRUD, SubmissionCRUD } from '@automagical/contracts';
import { LIB_FORMIO_SDK, PORTAL_RESOURCES } from '@automagical/contracts/constants';
import { FormDTO, UserDTO } from '@automagical/contracts/formio-sdk';
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
    @Inject(SubmissionCRUD) private readonly submissionService: SubmissionCRUD,
    @Inject(FormCRUD) private readonly formService: FormCRUD,
    private readonly formioSDK: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(user: UserDTO): Promise<UserDTO> {
    return await this.submissionService.create(user);
  }

  @Trace()
  public async findByEmail(user: UserDTO | string): Promise<UserDTO> {
    user = typeof user === 'string' ? user : user._id;
    return (
      await this.submissionService.findMany<UserDTO>({
        filters: new Set([{ field: 'data.email', value: user }]),
      })
    )[0];
  }

  @Trace()
  public async findById(user: UserDTO | string): Promise<UserDTO> {
    user = typeof user === 'string' ? user : user._id;
    return await this.submissionService.findById<UserDTO>(user);
  }

  @Trace()
  public async roleAdd(user: UserDTO | string, role: string): Promise<UserDTO> {
    user = typeof user === 'string' ? await this.findById(user) : user;
    user.roles ??= [];
    user.roles.push(role);
    return await this.update(user);
  }

  @Trace()
  public async roleRemove(
    user: UserDTO | string,
    role: string,
  ): Promise<UserDTO> {
    user = typeof user === 'string' ? await this.findById(user) : user;
    user.roles ??= [];
    user.roles = user.roles.filter((item) => item !== role);
    return await this.update(user);
  }

  @Trace()
  public async update(user: UserDTO): Promise<UserDTO> {
    return await this.submissionService.update(user);
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private async onModuleInit() {
    this.form = await this.formService.findByName(
      PORTAL_RESOURCES.user,
      this.formioSDK.PORTAL_BASE,
    );
    this.submissionService.attach(this.formioSDK.PORTAL_BASE, this.form);
  }

  // #endregion Private Methods
}
