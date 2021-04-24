import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { FormioSdkService } from '.';
import { HTTP_Methods } from '../../typings';
import { FetchWith } from '../../typings/HTTP';
type SubmissionArgs<
  T extends Record<never, string> = Record<never, string>
> = FetchWith<{ project: string; form: string; id?: string } & T>;

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

  public async get<T>(args: SubmissionArgs): Promise<T[]> {
    // resource & form are synonymous basically anywhere in the platform
    // The difference is in how you use them, but they both work over the same APIs
    // When in doubt, use resource > form here
    return await this.formioSdkService.fetch<T[]>({
      url: this.buildUrl(args),
      ...args,
    });
  }

  public async patch<T>(args: SubmissionArgs): Promise<T> {
    return await this.formioSdkService.fetch<T>({
      url: this.buildUrl(args),
      method: HTTP_Methods.PATCH,
      ...args,
    });
  }

  public async report(
    args: SubmissionArgs<{ $match: Record<string, unknown> }>,
  ): Promise<unknown> {
    return await this.formioSdkService.fetch({
      url: `/${args.project}/report`,
      method: HTTP_Methods.POST,
      body: JSON.stringify([
        {
          $match: args.$match,
        },
      ]),
      ...args,
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private buildUrl(args: SubmissionArgs) {
    const suffix = args.id ? `/${args.id}` : '';
    return `/${args.project}/${args.form}/submission${suffix}`;
  }

  // #endregion Private Methods
}
