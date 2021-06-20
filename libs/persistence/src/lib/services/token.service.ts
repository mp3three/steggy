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
    const result = await this.tokenModel
      .updateOne(this.merge(typeof token === 'string' ? token : token._id), {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update(source: TokenDTO): Promise<TokenDTO> {
    const result = await this.tokenModel
      .updateOne(this.merge(source._id), source)
      .exec();
    if (result.ok === 1) {
      return await this.findById(source._id);
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
    return await this.modifyQuery(
      control,
      this.tokenModel.findOne(this.merge(token, undefined, undefined, control)),
    )
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(TokenDTO)
  public async findMany(query: ResultControlDTO): Promise<TokenDTO[]> {
    return await this.modifyQuery(
      query,
      this.tokenModel.find(this.merge(query)),
    )
      .lean()
      .exec();
  }

  // #endregion Public Methods
}
