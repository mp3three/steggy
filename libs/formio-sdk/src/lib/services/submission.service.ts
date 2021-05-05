import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { HTTP_Methods } from '../../typings';
import { FetchWith } from '../../typings/HTTP';
import { FormioSdkService } from '.';
import { CommonID } from './formio-sdk.service';
type SubmissionArguments<
  T extends Record<never, string> = Record<never, string>
> = FetchWith<{ project?: CommonID; form: CommonID; id?: string } & T>;

type Z<T extends Record<never, string> = Record<never, string>> = {
  foo: false;
} & T;
const Y: Z<Partial<Record<'a', string>>> = { foo: false };
Y.a = 'asdf';

@Injectable()
export class SubmissionService {
  // #region Constructors

  constructor(
    @InjectLogger(SubmissionService, LIB_FORMIO_SDK)
    protected readonly logger: PinoLogger,
    private readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async get<T extends SubmissionDTO>(
    arguments_: SubmissionArguments,
  ): Promise<T[]> {
    // resource & form are synonymous basically anywhere in the platform
    // The difference is in how you use them, but they both work over the same APIs
    // When in doubt, use resource > form here
    return await this.formioSdkService.fetch<T[]>({
      url: this.buildUrl(arguments_),
      ...arguments_,
    });
  }

  @Trace()
  public async patch<T>(arguments_: SubmissionArguments): Promise<T> {
    return await this.formioSdkService.fetch<T>({
      method: HTTP_Methods.PATCH,
      url: this.buildUrl(arguments_),
      ...arguments_,
    });
  }

  @Trace()
  public async report(
    arguments_: SubmissionArguments<{ $match: Record<string, unknown> }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      body: JSON.stringify([
        {
          $match: arguments_.$match,
        },
      ]),
      method: HTTP_Methods.POST,
      url: `/${arguments_.project}/report`,
      ...arguments_,
    });
  }

  public async list<T extends SubmissionDTO>(
    arguments_: SubmissionArguments,
  ): Promise<T[]> {
    return await this.formioSdkService.fetch({
      url: this.buildUrl(arguments_),
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private buildUrl(arguments_: SubmissionArguments) {
    const suffix = arguments_.id ? `/${arguments_.id}` : '';
    return this.formioSdkService.projectUrl(
      arguments_.project,
      `/${this.formioSdkService.id(arguments_.form)}/submission${suffix}`,
    );
  }

  // #endregion Private Methods
}
