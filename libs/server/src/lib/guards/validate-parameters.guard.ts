import { PROJECT_KEYS } from '@automagical/config';
import type { ResponseLocals } from '@automagical/contracts';
import {
  ActionCRUD,
  FormCRUD,
  ProjectCRUD,
  SubmissionCRUD,
} from '@automagical/contracts';
import { LIB_SERVER } from '@automagical/contracts/constants';
import {
  ActionDTO,
  FormDTO,
  ProjectDTO,
  SubmissionDTO,
} from '@automagical/contracts/formio-sdk';
import type { APIRequest, APIResponse } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
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
    private readonly projectService: ProjectCRUD,
    @Inject(FormCRUD)
    private readonly formService: FormCRUD,
    @Inject(ActionCRUD)
    private readonly actionService: ActionCRUD,
    @Inject(SubmissionCRUD)
    private readonly submissionService: SubmissionCRUD,
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
    const action = await this.actionService.findById(
      request.params.actionId,
      locals.form,
    );
    if (!action) {
      throw new NotFoundException();
    }
    return plainToClass(ActionDTO, action);
  }

  @Trace()
  private async loadForm(
    request: APIRequest,
    { project }: ResponseLocals,
  ): Promise<FormDTO> {
    let form: FormDTO;
    if (request.params.formId) {
      form = await this.formService.findById(request.params.formId, project);
    } else if (request.params.formName) {
      form = await this.formService.findByName(
        request.params.formName,
        project,
      );
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
      project = await this.projectService.findById(request.params.projectId);
    }

    if (!project && request.params.projectName) {
      project = await this.projectService.findByName(
        request.params.projectName,
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
    { form, project }: ResponseLocals,
  ): Promise<SubmissionDTO> {
    if (!request.params.submissionId) {
      return;
    }
    const submission = await this.submissionService.findById(
      request.params.submissionId,
      form,
      project,
    );
    return plainToClass(SubmissionDTO, submission);
  }

  // #endregion Private Methods
}
