import { ActionProcess } from '@automagical/action';
import { SubmissionCRUD } from '@automagical/contracts';
import { LIB_SERVER } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import {
  FormDTO,
  ProjectDTO,
  SubmissionDTO,
} from '@automagical/contracts/formio-sdk';
import type { APIRequest } from '@automagical/contracts/server';
import {
  ACCESS_LEVEL,
  ACCESS_TYPE,
  ACTION_METHOD,
  PATH_PARAMETERS,
  SwaggerParameters,
} from '@automagical/contracts/server';
import { InjectLogger } from '@automagical/utilities';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { applyPatch, Operation } from 'fast-json-patch';
import { PinoLogger } from 'nestjs-pino';

import {
  Form,
  PermissionCheck,
  PermissionScope,
  Project,
  Submission,
} from '../decorators';
import { SubmissionValidatorInterceptor } from '../interceptors';
import { QueryToControlPipe, SubmissionValidatorPipe } from '../pipes';
import { ValidatorService } from '../services';

@Controller(
  `/project/:${PATH_PARAMETERS.projectId}/form/:${PATH_PARAMETERS.formId}/submission`,
)
@PermissionScope(ACCESS_TYPE.submission)
@ApiTags('submission')
@UseInterceptors(SubmissionValidatorInterceptor)
export class SubmissionController {
  // #region Constructors

  constructor(
    @InjectLogger(SubmissionController, LIB_SERVER)
    private readonly logger: PinoLogger,
    @Inject(SubmissionCRUD)
    private readonly submissionService: SubmissionCRUD,
    private readonly validatorService: ValidatorService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Delete(`/:submissionId`)
  @PermissionCheck(ACCESS_LEVEL.delete, { submission: true })
  @SwaggerParameters(
    PATH_PARAMETERS.projectId,
    PATH_PARAMETERS.formId,
    PATH_PARAMETERS.submissionId,
  )
  @ActionProcess(ACTION_METHOD.delete)
  public async delete(
    @Submission() submission: SubmissionDTO,
    @Project() project: ProjectDTO,
    @Form() form: FormDTO,
  ): Promise<string> {
    const result = await this.submissionService.delete(
      submission,
      form,
      project,
    );
    if (result) {
      return 'ok';
    }
    throw new InternalServerErrorException();
  }

  @Get('/exists')
  @PermissionCheck(ACCESS_LEVEL.read, { exists: true, submission: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async exists(
    @Query(QueryToControlPipe) filters: ResultControlDTO,
    @Project() project: ProjectDTO,
    @Form() form: FormDTO,
  ): Promise<Record<'_id', string>> {
    const result = await this.submissionService.findMany(
      filters,
      form,
      project,
    );
    if (result) {
      return {
        _id: result[0]._id,
      };
    }
    throw new NotFoundException();
  }

  @Get(`/:submissionId`)
  @PermissionCheck(ACCESS_LEVEL.read, { submission: true })
  @SwaggerParameters(
    PATH_PARAMETERS.projectId,
    PATH_PARAMETERS.formId,
    PATH_PARAMETERS.submissionId,
  )
  @ActionProcess(ACTION_METHOD.read)
  public async findById(
    @Submission() submission: SubmissionDTO,
  ): Promise<SubmissionDTO> {
    return submission;
  }

  @Get('/')
  @PermissionCheck(ACCESS_LEVEL.read, { submission: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  @ActionProcess(ACTION_METHOD.read)
  public async findMany(
    @Query(QueryToControlPipe) control: ResultControlDTO,
    @Project() project: ProjectDTO,
    @Form() form: FormDTO,
  ): Promise<SubmissionDTO[]> {
    return await this.submissionService.findMany(control, form, project);
  }

  @Patch(`/:submissionId`)
  @PermissionCheck(ACCESS_LEVEL.write, { submission: true })
  @SwaggerParameters(
    PATH_PARAMETERS.projectId,
    PATH_PARAMETERS.formId,
    PATH_PARAMETERS.submissionId,
  )
  @ActionProcess(ACTION_METHOD.update)
  public async patch(
    @Submission() submission: SubmissionDTO,
    @Body() patch: Operation[],
    @Req() request: APIRequest<SubmissionDTO>,
    @Form() form: FormDTO,
    @Project() project: ProjectDTO,
  ): Promise<SubmissionDTO> {
    applyPatch(submission, patch).newDocument;
    submission = await this.validatorService.validateSubmission(
      submission,
      request,
    );
    return await this.submissionService.update(submission, form, project);
  }

  @Post('/')
  @PermissionCheck(ACCESS_LEVEL.create, { submission: true })
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  @ActionProcess(ACTION_METHOD.create)
  public async create(
    @Body() submission: SubmissionDTO,
  ): Promise<SubmissionDTO> {
    return submission;
  }

  @Post('/validate')
  @SwaggerParameters(PATH_PARAMETERS.projectId, PATH_PARAMETERS.formId)
  public async validate(
    @Body(SubmissionValidatorPipe) submission: SubmissionDTO,
  ): Promise<SubmissionDTO> {
    return submission;
  }

  @Put(`/:submissionId`)
  @PermissionCheck(ACCESS_LEVEL.write, { submission: true })
  @SwaggerParameters(
    PATH_PARAMETERS.projectId,
    PATH_PARAMETERS.formId,
    PATH_PARAMETERS.submissionId,
  )
  @ActionProcess(ACTION_METHOD.update)
  public async update(
    @Body() submission: SubmissionDTO,
  ): Promise<SubmissionDTO> {
    return submission;
  }

  // #endregion Public Methods
}
