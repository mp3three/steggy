import { LIB_SERVER } from '@formio/contracts/constants';
import { FormDTO } from '@formio/contracts/formio-sdk';
import { APIRequest } from '@formio/contracts/server';
import { InjectLogger, Trace } from '@formio/utilities';
import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
  Scope,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';

@Injectable({ scope: Scope.REQUEST })
export class FormValidatorPipe implements PipeTransform {
  // #region Constructors

  constructor(
    @InjectLogger(FormValidatorPipe, LIB_SERVER)
    protected readonly logger: PinoLogger,
    @Inject(APIRequest)
    private readonly request: APIRequest,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * This method must either return `value`, or throw an error
   */
  @Trace()
  public async transform(
    value: FormDTO,
    { metatype }: ArgumentMetadata,
  ): Promise<FormDTO> {
    const { project, form, user } = this.request.res.locals;
    if (form) {
      this.checkFormUpdate(value, form);
    } else {
      // New form
      value.owner = user?._id;
      value.machineName ??= `${project.machineName || project.name}:${
        value.name
      }`;
    }
    value.project = project._id;

    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException({ errors });
    }
    return value;
  }

  // #endregion Public Methods

  // #region Private Methods

  private checkFormUpdate(value: FormDTO, form: FormDTO): void | never {
    // An update to the form
    if (form.owner !== value.owner) {
      throw new BadRequestException(`Cannot change owner`);
    }
    value.access ??= [];
    value.access.forEach((access) => {
      const formAccess = form.access || [];
      if (formAccess.length === 0 && access.roles.length === 0) {
        return;
      }
      const alreadyExists = formAccess.some((item) => {
        if (item.permission !== access.permission) {
          return false;
        }
        return (
          // Does the permission match?
          item.permission === access.permission &&
          item.type === access.type &&
          // Every role that exists in request must already exist in the current role
          access.roles.every((roleId) => item.roles.includes(roleId))
        );
      });
      // Either new role added to existing permission, or new permission added
      if (!alreadyExists && access.roles.length > 0) {
        throw new BadRequestException(
          'Access additions not permitted through this route',
        );
      }
    });
  }

  // #endregion Private Methods
}
