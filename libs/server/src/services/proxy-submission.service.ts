import { CrudOptions, SubmissionCRUD } from '@formio/contracts';
import { PROJECT_KEYS } from '@formio/contracts/config';
import { APP_API_SERVER } from '@formio/contracts/constants';
import { ResultControlDTO } from '@formio/contracts/fetch';
import {
  FormDTO,
  ProjectDTO,
  SubmissionDTO,
} from '@formio/contracts/formio-sdk';
import { SubmissionService } from '@formio/formio-sdk';
import { InjectLogger, Trace } from '@formio/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ProxySubmissionService<
  // Needed for interface compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Generic extends SubmissionDTO = SubmissionDTO,
> implements SubmissionCRUD
{
  // #region Object Properties

  private form: FormDTO;
  private keyMap: Map<string, string>;
  private project: ProjectDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(ProxySubmissionService, APP_API_SERVER)
    private readonly logger: PinoLogger,
    @Inject(SubmissionCRUD) private readonly submissionCrud: SubmissionCRUD,
    private readonly submissionService: SubmissionService,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create<T extends SubmissionDTO = SubmissionDTO>(
    submission: T,
    options: CrudOptions,
  ): Promise<T> {
    const { project } = options;
    const apiKey = this.getKey(project);
    if (!apiKey) {
      return await this.submissionCrud.create(submission, options);
    }
    return await this.submissionService.create(submission, options);
  }

  @Trace()
  public async delete(
    submission: SubmissionDTO,
    options: CrudOptions,
  ): Promise<boolean> {
    const { project } = options;
    const apiKey = this.getKey(project);
    if (!apiKey) {
      return await this.submissionCrud.delete(submission, options);
    }
    return await this.submissionService.delete(submission, options);
  }

  @Trace()
  public async findById<T extends SubmissionDTO = SubmissionDTO>(
    submission: string,
    options: CrudOptions,
  ): Promise<T> {
    const { project } = options;
    const apiKey = this.getKey(project);
    if (!apiKey) {
      return await this.submissionCrud.findById(submission, options);
    }
    return await this.submissionService.findById(submission, options);
  }

  @Trace()
  public async findMany<T extends SubmissionDTO = SubmissionDTO>(
    query: ResultControlDTO,
    options: CrudOptions,
  ): Promise<T[]> {
    const { project } = options;
    const apiKey = this.getKey(project);
    if (!apiKey) {
      return await this.submissionCrud.findMany(query, options);
    }
    return await this.submissionService.findMany<T>(query, options);
  }

  @Trace()
  public async findOne<T extends SubmissionDTO = SubmissionDTO>(
    query: ResultControlDTO,
    options: CrudOptions,
  ): Promise<T> {
    const { project } = options;
    const apiKey = this.getKey(project);
    if (!apiKey) {
      return await this.submissionCrud.findOne<T>(query, options);
    }
    return await this.submissionService.findOne<T>(query, options);
  }

  @Trace()
  public async update<T extends SubmissionDTO = SubmissionDTO>(
    source: T,
    options: CrudOptions,
  ): Promise<T> {
    const { project } = options;
    const apiKey = this.getKey(project);
    if (!apiKey) {
      return await this.submissionCrud.update(source, options);
    }
    return await this.submissionService.update(source, options);
  }

  public attach(project?: ProjectDTO, form?: FormDTO): void {
    this.project = project;
    this.form = form;
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private async onModuleInit() {
    this.keyMap = new Map(
      Object.entries(
        this.configService.get<Record<string, string>>(PROJECT_KEYS, {}),
      ),
    );
  }

  private getKey(project: ProjectDTO | string): string {
    project = typeof project === 'string' ? project : project._id;
    return this.keyMap.get(project);
  }

  // #endregion Private Methods
}
