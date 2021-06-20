import { SessionCRUD } from '@automagical/contracts';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { SessionDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@automagical/utilities';
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
  public async update(source: SessionDTO): Promise<SessionDTO> {
    const result = await this.sessionModel
      .updateOne(this.merge(source._id), source)
      .exec();
    if (result.ok === 1) {
      return await this.findById(source._id);
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
    return await this.modifyQuery(
      control,
      this.sessionModel.findOne(
        this.merge(session, undefined, undefined, control),
      ),
    )
      .lean()
      .exec();
  }

  // #endregion Public Methods
}
