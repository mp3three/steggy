import { CrudOptions, FormSupport } from '@formio/contracts';
import { FormDTO } from '@formio/contracts/formio-sdk';
import { InjectLogger, Trace } from '@formio/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class FormSupportService implements FormSupport {
  // #region Constructors

  constructor(
    @InjectLogger(FormSupportService) private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async getRevision(
    revision: string,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async listRevisions(
    form: FormDTO,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async swagger(options: CrudOptions): Promise<unknown> {
    throw new NotImplementedException();
  }

  /**
   * Form => exported form 🕊
   */
  public exportForm(form: Readonly<FormDTO>): FormDTO {
    return {
      access: form.access,
      components: form.components,
      machineName: form.name,
      name: form.name,
      path: form.path,
      submissionAccess: form.submissionAccess,
      tags: form.tags,
      title: form.title,
      type: form.type,
    };
  }

  // #endregion Public Methods
}
