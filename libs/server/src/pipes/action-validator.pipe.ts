import { FormCRUD } from '@automagical/contracts';
import { SaveActionSettingsDTO } from '@automagical/contracts/action';
import { LIB_SERVER } from '@automagical/contracts/constants';
import {
  ACTION_NAMES,
  ActionDTO,
  SubmissionDTO,
} from '@automagical/contracts/formio-sdk';
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
export class ActionValidatorPipe implements PipeTransform {
  // #region Constructors

  constructor(
    @InjectLogger(ActionValidatorPipe, LIB_SERVER)
    protected readonly logger: PinoLogger,
    @Inject(APIRequest)
    private readonly request: APIRequest,
    @Inject(FormCRUD)
    private readonly formService: FormCRUD,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * This method must either return `value`, or throw an error
   */
  @Trace()
  public async transform(
    value:
      | SubmissionDTO<ActionDTO<SaveActionSettingsDTO>>
      | ActionDTO<SaveActionSettingsDTO>,
    { metatype }: ArgumentMetadata,
  ): Promise<ActionDTO> {
    // Remove from submission body
    if (!(value instanceof ActionDTO)) {
      value = value.data;
    }
    const { project, form, user, action } = this.request.res.locals;
    value.form = form._id;
    value.project = project._id;

    if (action) {
      this.checkUpdate(value, action);
    } else {
      // New form
      value.owner = user?._id;
      value.machineName ??= `${project.machineName || project.name}:${
        project.machineName || form.name
      }:${Date.now() || value.name}`;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException({ errors });
    }
    if (value.name === ACTION_NAMES.save) {
      await this.validateSave(value);
    }
    return value;
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private checkUpdate(value: ActionDTO, action: ActionDTO): void | never {
    // An update to the form
    if (action.owner !== value.owner) {
      throw new BadRequestException(`Cannot change owner`);
    }
  }

  @Trace()
  private async validateSave(
    action: ActionDTO<SaveActionSettingsDTO>,
  ): Promise<void | never> {
    const { project } = this.request.res.locals;
    if (action.settings.resource) {
      const resource = await this.formService.findById(
        action.settings.resource,
        this.request.res.locals,
      );
      if (!resource) {
        throw new BadRequestException('Bad action resource');
      }
      if (resource.project !== project._id) {
        throw new BadRequestException(
          'Linked resource must belong to same project as action',
        );
      }
    }
  }

  // #endregion Private Methods
}
