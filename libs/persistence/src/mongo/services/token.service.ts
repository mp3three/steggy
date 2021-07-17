import { TokenCRUD } from '@automagical/contracts';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { TokenDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { TokenDocument } from '../schema';
import { BaseMongoService } from './base-mongo.service';

@Injectable()
export class TokenPersistenceMongoService
  extends BaseMongoService
  implements TokenCRUD
{
  // #region Constructors

  constructor(
    @InjectLogger(TokenPersistenceMongoService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(TokenDTO)
    private readonly tokenModel: Model<TokenDocument>,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async delete(token: TokenDTO | string): Promise<boolean> {
    const query = this.merge(typeof token === 'string' ? token : token._id);
    this.logger.debug({ query }, `delete query`);
    const result = await this.tokenModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update(token: TokenDTO): Promise<TokenDTO> {
    const query = this.merge(token._id);
    this.logger.debug({ query, token }, `update query`);
    const result = await this.tokenModel.updateOne(query, token).exec();
    if (result.ok === 1) {
      return await this.findById(token._id);
    }
  }

  @Trace()
  @ToClass(TokenDTO)
  public async create(form: TokenDTO): Promise<TokenDTO> {
    return (await this.tokenModel.create(form)).toObject();
  }

  @Trace()
  @ToClass(TokenDTO)
  public async findById(
    token: string,
    control?: ResultControlDTO,
  ): Promise<TokenDTO> {
    const query = this.merge(token, undefined, undefined, control);
    this.logger.debug({ query }, `findById query`);
    return await this.modifyQuery(control, this.tokenModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(TokenDTO)
  public async findMany(control: ResultControlDTO): Promise<TokenDTO[]> {
    const query = this.merge(control);
    this.logger.debug({ query }, `findMany query`);
    return await this.modifyQuery(control, this.tokenModel.find(query))
      .lean()
      .exec();
  }

  // #endregion Public Methods
}
