import { Injectable } from '@nestjs/common';
import { FormioSdkService } from '.';
import { iLogger, Logger } from '@automagical/logger';
import { FetchWith } from '../../typings/HTTP';
import { HTTP_Methods } from '../../typings';

type SubmissionArgs<
  T extends Record<never, string> = Record<never, string>
> = FetchWith<
  Partial<Record<'form' | 'resource', string>> & { project: string } & T
>;

type Z<T extends Record<never, string> = Record<never, string>> = {
  foo: false;
} & T;
const Y: Z<Partial<Record<'a', string>>> = { foo: false };
Y.a = 'asdf';

@Injectable()
export class SubmissionService {
  // #region Static Properties

  public static logger: iLogger;

  // #endregion Static Properties

  // #region Object Properties

  private logger = Logger(SubmissionService);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly formioSdkService: FormioSdkService) {}

  // #endregion Constructors

  // #region Public Methods

  public async list<T>(args: SubmissionArgs) {
    // resource & form are synonymous basically anywhere in the platform
    // The difference is in how you use them, but they both work over the same APIs
    // When in doubt, use resource > form here
    return this.formioSdkService.fetch<T[]>({
      url: this.buildUrl(args),
      ...args,
    });
  }

  public async patch(args: SubmissionArgs) {
    return this.formioSdkService.fetch({
      url: this.buildUrl(args),
      method: HTTP_Methods.PATCH,
      ...args,
    });
  }

  public async report(
    args: SubmissionArgs<{ $match: Record<string, unknown> }>,
  ) {
    return this.formioSdkService.fetch({
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
    return `/${args.project}/form/${args.resource || args.form}/submission`;
  }

  // #endregion Private Methods
}
