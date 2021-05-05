import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { SubmissionDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import { SubmissionDocument } from '@automagical/persistence';
import { InjectLogger, InjectMongo, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SubmissionService {
  // #region Constructors

  constructor(
    @InjectLogger(SubmissionService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(SubmissionDTO)
    private readonly submissionModel: Model<SubmissionDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(
    project: SubmissionDTO,
    owner?: UserDTO,
  ): Promise<SubmissionDTO> {
    project.owner = project.owner || owner?._id;
    return await this.submissionModel.create(project);
  }

  @Trace()
  public async delete(project: SubmissionDTO | string): Promise<boolean> {
    if (typeof project === 'object') {
      project = project._id;
    }
    const result = await this.submissionModel
      .updateOne(
        { _id: project },
        {
          deleted: Date.now(),
        },
      )
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async findById(
    project: SubmissionDTO | string,
  ): Promise<SubmissionDTO> {
    if (typeof project === 'object') {
      project = project._id;
    }
    return await this.submissionModel.findOne({
      _id: project,
      deleted: null,
    });
  }

  @Trace()
  public async findMany(
    query: Record<string, unknown> = {},
  ): Promise<SubmissionDTO[]> {
    return await this.submissionModel
      .find({
        deleted: null,
        ...query,
      })
      .exec();
  }

  @Trace()
  public async hardDelete(project: SubmissionDTO | string): Promise<boolean> {
    if (typeof project === 'object') {
      project = project._id;
    }
    const result = await this.submissionModel.deleteOne({
      _id: project,
    });
    return result.ok === 1;
  }

  @Trace()
  public async update(
    source: SubmissionDTO | string,
    update: Omit<Partial<SubmissionDTO>, '_id' | 'created'>,
  ): Promise<boolean> {
    if (typeof source === 'object') {
      source = source._id;
    }
    const result = await this.submissionModel
      .updateOne({ _id: source, deleted: null }, update)
      .exec();
    return result.ok === 1;
  }

  // #endregion Public Methods
}
