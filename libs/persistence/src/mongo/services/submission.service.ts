import { CrudOptions, SubmissionCRUD } from '@formio/contracts';
import { LIB_PERSISTENCE } from '@formio/contracts/constants';
import { ResultControlDTO } from '@formio/contracts/fetch';
import {
  FormDTO,
  ProjectDTO,
  SubmissionDTO,
} from '@formio/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@formio/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { EncryptionService } from '../../services/encryption.service';
import { SubmissionDocument } from '../schema';
import { BaseMongoService } from './base-mongo.service';

@Injectable()
export class SubmissionPersistenceMongoService
  extends BaseMongoService
  implements SubmissionCRUD
{
  // #region Object Properties

  private form: FormDTO;
  private project: ProjectDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(SubmissionPersistenceMongoService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(SubmissionDTO)
    private readonly submissionModel: Model<SubmissionDocument>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async delete(
    submission: SubmissionDTO | string,
    { form, project }: CrudOptions,
  ): Promise<boolean> {
    form ??= this.form;
    project ??= this.project;
    const query = this.merge(
      typeof submission === 'string' ? submission : submission._id,
      project,
      form,
    );
    const result = await this.submissionModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update<T extends SubmissionDTO = SubmissionDTO>(
    submission: SubmissionDTO,
    options: CrudOptions,
  ): Promise<T> {
    let { form, project } = options;
    form ??= this.form;
    project ??= this.project;
    submission = this.encrypt(submission, form, project);
    const query = this.merge(submission._id, project, form);
    this.logger.debug({ query, submission }, `update query`);
    const result = await this.submissionModel
      .updateOne(query, submission)
      .exec();
    if (result.ok === 1) {
      return await this.findById(submission._id, options);
    }
  }

  @Trace()
  @ToClass(SubmissionDTO)
  public async create<T extends SubmissionDTO = SubmissionDTO>(
    submission: T,
    { form, project }: CrudOptions,
  ): Promise<T> {
    form ??= this.form;
    project ??= this.project;
    return this.decrypt<T>(
      (
        await this.submissionModel.create(
          this.encrypt<T>(submission, form, project),
        )
      ).toObject() as T,
      form,
      project,
    );
  }

  @Trace()
  @ToClass(SubmissionDTO)
  public async findById<T extends SubmissionDTO = SubmissionDTO>(
    submission: string,
    { form, project, control }: CrudOptions,
  ): Promise<T> {
    form ??= this.form;
    project ??= this.project;
    const query = this.merge(submission, project, form);
    this.logger.debug({ query }, `findById query`);
    const search = this.modifyQuery(
      control,
      this.submissionModel.findOne(query),
    );
    const result = await search.lean().exec();
    return this.decrypt<T>(result as T, form, project);
  }

  @Trace()
  @ToClass(SubmissionDTO)
  public async findMany<T extends SubmissionDTO = SubmissionDTO>(
    control: ResultControlDTO,
    { form, project }: CrudOptions,
  ): Promise<T[]> {
    form ??= this.form;
    project ??= this.project;
    const query = this.merge(control, project, form);
    this.logger.debug({ query }, `findMany query`);
    const search = this.modifyQuery(query, this.submissionModel.find(query));
    return this.decryptMany<T>(
      (await search.lean().exec()) as T[],
      form,
      project,
    );
  }

  @Trace()
  @ToClass(SubmissionDTO)
  public async findOne<T extends SubmissionDTO = SubmissionDTO>(
    query: ResultControlDTO,
    { form, project }: CrudOptions,
  ): Promise<T> {
    form ??= this.form;
    project ??= this.project;
    const search = this.modifyQuery(
      query,
      this.submissionModel.findOne(this.merge(query, project, form)),
    );
    return this.decrypt<T>((await search.lean().exec()) as T, form, project);
  }

  public attach(project?: ProjectDTO, form?: FormDTO): void {
    this.project = project;
    this.form = form;
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private decrypt<T extends SubmissionDTO = SubmissionDTO>(
    submission: T,
    form: FormDTO,
    project: ProjectDTO,
  ): T {
    return this.encryptionService.setSubmissionEncryption<T>(
      submission,
      form,
      project,
      false,
    );
  }

  @Trace()
  private decryptMany<T extends SubmissionDTO = SubmissionDTO>(
    submission: T[],
    form: FormDTO,
    project: ProjectDTO,
  ): T[] {
    return submission.map((item) => this.decrypt(item, form, project));
  }

  @Trace()
  private encrypt<T extends SubmissionDTO = SubmissionDTO>(
    submission: T,
    form: FormDTO,
    project: ProjectDTO,
  ): T {
    return this.encryptionService.setSubmissionEncryption<T>(
      submission,
      form,
      project,
      true,
    );
  }

  // #endregion Private Methods
}
