import { LIB_SERVER } from '@automagical/contracts/constants';
import { HTTP_METHODS } from '@automagical/contracts/fetch';
import { ProjectDTO } from '@automagical/contracts/formio-sdk';
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
export class ProjectValidatorPipe implements PipeTransform {
  // #region Constructors

  constructor(
    @InjectLogger(ProjectValidatorPipe, LIB_SERVER)
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
    value: ProjectDTO,
    { metatype }: ArgumentMetadata,
  ): Promise<ProjectDTO> {
    const { project, user, method } = this.request.res.locals;
    if (project) {
      if (project.owner !== value.owner) {
        throw new BadRequestException(`Cannot change owner`);
      }
    } else {
      value.owner = user?._id;
      value.machineName ??= value.name;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object, {
      skipUndefinedProperties: method === HTTP_METHODS.put,
    });
    if (errors.length > 0) {
      this.logger.error({ errors }, 'wat');
      throw new BadRequestException({ errors });
    }
    return value;
  }

  // #endregion Public Methods
}
