import { LIB_SERVER } from '@automagical/contracts/constants';
import { RoleDTO } from '@automagical/contracts/formio-sdk';
import { APIRequest } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
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
export class RoleValidatorPipe implements PipeTransform {
  // #region Constructors

  constructor(
    @InjectLogger(RoleValidatorPipe, LIB_SERVER)
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
    value: RoleDTO,
    { metatype }: ArgumentMetadata,
  ): Promise<RoleDTO> {
    const { project } = this.request.res.locals;

    value.project = project._id;
    value.machineName ??= `${project.machineName ?? project.name}:${
      value.title.toLocaleLowerCase().split(' ')[0]
    }`;

    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException({ errors });
    }
    return value;
  }

  // #endregion Public Methods
}
