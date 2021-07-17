import type { ResponseLocals } from '@formio/contracts';
import {
  ActionCRUD,
  FormCRUD,
  ProjectCRUD,
  SubmissionCRUD,
} from '@formio/contracts';
import { PROJECT_KEYS } from '@formio/contracts/config';
import { LIB_SERVER } from '@formio/contracts/constants';
import {
  ActionDTO,
  FormDTO,
  ProjectDTO,
  SubmissionDTO,
} from '@formio/contracts/formio-sdk';
import type { APIRequest, APIResponse } from '@formio/contracts/server';
import { InjectLogger, Trace } from '@formio/utilities';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { PinoLogger } from 'nestjs-pino';

/**
 * This has to be a guard because anything prior to this point in the pipeline doesn't have access to request.params
 *
 * It's super annoying
 */
@Injectable()
export class ValidateParametersGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger(ValidateParametersGuard, LIB_SERVER)
    private readonly logger: PinoLogger,
    @Inject(ProjectCRUD)
    private readonly projectCrud: ProjectCRUD,
    @Inject(FormCRUD)
    private readonly formCrud: FormCRUD,
    @Inject(ActionCRUD)
    private readonly actionCrud: ActionCRUD,
    @Inject(SubmissionCRUD)
    private readonly submissionCrud: SubmissionCRUD,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { locals } = context.switchToHttp().getResponse<APIResponse>();
    locals.project = await this.loadProject(request);
    locals.form = await this.loadForm(request, locals);
    locals.submission = await this.loadSubmission(request, locals);
    locals.action = await this.loadAction(request, locals);

    locals.projectApiKey = this.configService.get(
      `${PROJECT_KEYS}.${request.params.projectId}`,
    );
    return true;
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private async loadAction(
    request: APIRequest,
    locals: ResponseLocals,
  ): Promise<ActionDTO> {
    if (!request.params.actionId) {
      return;
    }
    const action = await this.actionCrud.findById(
      request.params.actionId,
      locals,
    );
    if (!action) {
      throw new NotFoundException();
    }
    return plainToClass(ActionDTO, action);
  }

  @Trace()
  private async loadForm(
    request: APIRequest,
    locals: ResponseLocals,
  ): Promise<FormDTO> {
    let form: FormDTO;
    if (request.params.formId) {
      form = await this.formCrud.findById(request.params.formId, locals);
    } else if (request.params.formName) {
      form = await this.formCrud.findByName(request.params.formName, locals);
    } else {
      return;
    }
    if (!form) {
      throw new NotFoundException();
    }
    return plainToClass(FormDTO, form);
  }

  @Trace()
  private async loadProject(request: APIRequest): Promise<ProjectDTO> {
    let project: ProjectDTO;
    if (request.params.projectId) {
      project = await this.projectCrud.findById(
        request.params.projectId,
        request.res.locals,
      );
    }

    if (!project && request.params.projectName) {
      project = await this.projectCrud.findByName(
        request.params.projectName,
        request.res.locals,
      );
    }
    if (!project) {
      return;
    }
    return plainToClass(ProjectDTO, project);
  }

  @Trace()
  private async loadSubmission(
    request: APIRequest,
    locals: ResponseLocals,
  ): Promise<SubmissionDTO> {
    if (!request.params.submissionId) {
      return;
    }
    const submission = await this.submissionCrud.findById(
      request.params.submissionId,
      locals,
    );
    return plainToClass(SubmissionDTO, submission);
  }

  // #endregion Private Methods
}
