import { TeamAdapter } from '@automagical/contracts';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import {
  ProjectDTO,
  SubmissionDTO,
  TeamDTO,
  TeamMemberDTO,
} from '@automagical/contracts/formio-sdk';
import { MONGO_COLLECTIONS } from '@automagical/contracts/persistence';
import { InjectLogger, InjectMongo, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { EncryptionService } from '../../services/encryption.service';
import { MongooseConnection } from '../classes';
import { ProjectDocument, SubmissionDocument } from '../schema';
import { ProjectPersistenceMongoService } from './project.service';

@Injectable()
export class TeamPersistenceMongoService implements TeamAdapter {
  // #region Constructors

  constructor(
    @InjectLogger(TeamPersistenceMongoService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(ProjectDTO)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectMongo(SubmissionDTO)
    private readonly submissionModel: Model<SubmissionDocument>,
    private readonly encryptionService: EncryptionService,
    private readonly projectService: ProjectPersistenceMongoService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async getTeamProjects(team: TeamDTO | string): Promise<ProjectDTO[]> {
    team = typeof team === 'string' ? team : team._id;
    return this.projectService.decrypt(
      await this.projectModel
        .find({
          $and: [
            {
              $or: [
                { 'access.type': 'team_access' },
                { 'access.type': 'team_read' },
                { 'access.type': 'team_write' },
                { 'access.type': 'team_admin' },
              ],
            },
            {
              'access.roles': {
                $in: [team, Types.ObjectId(team)],
              },
            },
            { project: null },
          ],
          deleted: null,
        })
        .lean()
        .exec(),
    ) as ProjectDTO[];
  }

  @Trace()
  public async getUserTeams(
    control: ResultControlDTO,
  ): Promise<TeamMemberDTO[]> {
    const query = MongooseConnection.filtersToMongoQuery(control).entries();
    return this.submissionModel
      .aggregate([
        { $match: query },
        {
          $lookup: {
            as: `data.team`,
            foreignField: '_id',
            from: MONGO_COLLECTIONS.submissions,
            localField: `data.team._id`,
          },
        },
        {
          $unwind: {
            path: `$data.team`,
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .exec();
  }

  // #endregion Public Methods
}
