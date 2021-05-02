import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { SubmissionDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import { indexOptions, indexQuery } from '@automagical/fetch';
import { SubmissionDocument } from '@automagical/persistence';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SubmissionService {
  // #region Constructors

  constructor(
    @InjectLogger(SubmissionService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    @InjectModel(SubmissionDTO.name)
    private readonly submissionModel: Model<SubmissionDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async byId(submissionId: string): Promise<SubmissionDTO> {
    return await this.submissionModel
      .findOne({
        _id: submissionId,
      })
      .exec();
  }

  @Trace()
  public async create(
    submission: SubmissionDTO,
    owner?: UserDTO,
  ): Promise<SubmissionDTO> {
    submission.owner = submission.owner || owner?._id;
    return await this.submissionModel.create(submission);
  }

  @Trace()
  public async list(arguments_: {
    query?: Record<string, string>;
    user?: UserDTO;
  }): Promise<{ count: number; items: SubmissionDTO[] }> {
    const query = new Map(Object.entries(arguments_.query || {}));
    let map = indexQuery(query);
    map = indexOptions(query, map);
    const search = Object.fromEntries(map.entries());
    return {
      count: await this.submissionModel.count(search),
      items: await this.submissionModel.find(search),
    };
  }

  @Trace()
  public async update(
    submissionId: string,
    submission: SubmissionDTO,
  ): Promise<SubmissionDTO> {
    // Shame on you
    submission._id = submissionId;
    await this.submissionModel.updateOne({ _id: submissionId }, submission);
    return submission;
  }

  // #endregion Public Methods
}
