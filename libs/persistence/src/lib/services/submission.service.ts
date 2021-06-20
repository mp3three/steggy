import { SubmissionCRUD } from '@automagical/contracts';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import {
  FormDTO,
  ProjectDTO,
  SubmissionDTO,
} from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@automagical/utilities';
import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { SubmissionDocument } from '../schema';
import { BaseMongoService } from './base-mongo.service';
import { EncryptionService } from './encryption.service';

@Injectable({ scope: Scope.TRANSIENT })
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
    form?: FormDTO,
    project?: ProjectDTO,
  ): Promise<boolean> {
    form ??= this.form;
    project ??= this.project;
    const result = await this.submissionModel
      .updateOne(
        this.merge(
          typeof submission === 'string' ? submission : submission._id,
          project,
          form,
        ),
        {
          deleted: Date.now(),
        },
      )
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update<T extends SubmissionDTO = SubmissionDTO>(
    submission: SubmissionDTO,
    form?: FormDTO,
    project?: ProjectDTO,
  ): Promise<T> {
    form ??= this.form;
    project ??= this.project;
    const result = await this.submissionModel
      .updateOne(
        this.merge(submission._id, project, form),
        this.encrypt(submission, form, project),
      )
      .exec();
    if (result.ok === 1) {
      return await this.findById(submission._id, form, project);
    }
  }

  @Trace()
  @ToClass(SubmissionDTO)
  public async create<T extends SubmissionDTO = SubmissionDTO>(
    submission: T,
    form?: FormDTO,
    project?: ProjectDTO,
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
    form?: FormDTO,
    project?: ProjectDTO,
    control?: ResultControlDTO,
  ): Promise<T> {
    form ??= this.form;
    project ??= this.project;
    const search = this.modifyQuery(
      control,
      this.submissionModel.findOne(this.merge(submission, project, form)),
    );
    return this.decrypt<T>((await search.lean().exec()) as T, form, project);
  }

  @Trace()
  @ToClass(SubmissionDTO)
  public async findMany<T extends SubmissionDTO = SubmissionDTO>(
    query: ResultControlDTO,
    form?: FormDTO,
    project?: ProjectDTO,
  ): Promise<T[]> {
    form ??= this.form;
    project ??= this.project;
    const search = this.modifyQuery(
      query,
      this.submissionModel.find(this.merge(query, project, form)),
    );
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
    form?: FormDTO,
    project?: ProjectDTO,
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
