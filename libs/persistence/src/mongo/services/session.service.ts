import { SessionCRUD } from '@formio/contracts';
import { LIB_PERSISTENCE } from '@formio/contracts/constants';
import { ResultControlDTO } from '@formio/contracts/fetch';
import { SessionDTO } from '@formio/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@formio/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { SessionDocument } from '../schema';
import { BaseMongoService } from './base-mongo.service';

@Injectable()
export class SessionPersistenceMongoService
  extends BaseMongoService
  implements SessionCRUD
{
  // #region Constructors

  constructor(
    @InjectLogger(SessionPersistenceMongoService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(SessionDTO)
    private readonly sessionModel: Model<SessionDocument>,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async update(session: SessionDTO): Promise<SessionDTO> {
    const query = this.merge(session._id);
    this.logger.debug({ query, session }, `update query`);
    const result = await this.sessionModel.updateOne(query, session).exec();
    if (result.ok === 1) {
      return await this.findById(session._id);
    }
  }

  @Trace()
  @ToClass(SessionDTO)
  public async create(session: SessionDTO): Promise<SessionDTO> {
    return (await this.sessionModel.create(session)).toObject();
  }

  @Trace()
  @ToClass(SessionDTO)
  public async findById(
    session: string,
    control?: ResultControlDTO,
  ): Promise<SessionDTO> {
    const query = this.merge(session, undefined, undefined, control);
    this.logger.debug({ query }, `findById query`);
    return await this.modifyQuery(control, this.sessionModel.findOne(query))
      .lean()
      .exec();
  }

  // #endregion Public Methods
}
