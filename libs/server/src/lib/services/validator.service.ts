import { ResponseFlags } from '@automagical/contracts';
import { LIB_SERVER } from '@automagical/contracts/constants';
import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import type { APIRequest } from '@automagical/contracts/server';
import { FormValidator } from '@automagical/contracts/validation';
import { InjectLogger, Trace } from '@automagical/utilities';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ValidatorService {
  // #region Constructors

  constructor(
    @InjectLogger(ValidatorService, LIB_SERVER)
    private readonly logger: PinoLogger,
    @Inject(FormValidator)
    private readonly validatorService: FormValidator,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async validateSubmission(
    value: SubmissionDTO,
    request: APIRequest<SubmissionDTO>,
  ): Promise<SubmissionDTO> {
    const { locals } = request.res;
    if (locals.submission) {
      // Is it allowed to "claim" a submission?
      // Potential logic hole here
      if (value.owner && locals.submission.owner !== value.owner) {
        throw new BadRequestException('Cannot update owner');
      }
    } else {
      value.owner = locals.user?._id.toString();
    }
    value.project = locals.project._id.toString();
    value.form = locals.form._id.toString();

    const object = plainToClass(SubmissionDTO, value) as SubmissionDTO;
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException({ errors });
    }
    if (!this.shouldValidate(request as APIRequest)) {
      return value;
    }
    return await this.validatorService.validate(locals.form, value);
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private shouldValidate(request: APIRequest) {
    const { flags } = request.res.locals;
    if (request.body.draft) {
      return false;
    }
    if (flags.has(ResponseFlags.ADMIN) && request.query?.noValidate) {
      return false;
    }
    return true;
  }

  // #endregion Private Methods
}
