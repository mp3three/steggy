import { ActionItemCRUD } from '@automagical/contracts';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { ActionItemDTO, FormDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { ActionItemDocument } from '../schema';
import { BaseMongoService } from './base-mongo.service';

@Injectable()
export class ActionItemPersistenceMongoService
  extends BaseMongoService
  implements ActionItemCRUD
{
  // #region Constructors

  constructor(
    @InjectLogger(ActionItemPersistenceMongoService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(ActionItemDTO)
    private readonly actionItemModel: Model<ActionItemDocument>,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async delete(item: ActionItemDTO, form: FormDTO): Promise<boolean> {
    const result = await this.actionItemModel
      .updateOne(this.merge(item._id, undefined, form), {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update(
    item: ActionItemDTO,
    form: FormDTO,
  ): Promise<ActionItemDTO> {
    const result = await this.actionItemModel
      .updateOne(this.merge(item._id, undefined, form), item)
      .exec();
    if (result.ok === 1) {
      return await this.findById(item._id, form);
    }
  }

  @Trace()
  @ToClass(ActionItemDTO)
  public async create(actionItem: ActionItemDTO): Promise<ActionItemDTO> {
    return (await this.actionItemModel.create(actionItem)).toObject();
  }

  @Trace()
  @ToClass(ActionItemDTO)
  public async findById(
    itemId: string,
    form: FormDTO,
    query?: ResultControlDTO,
  ): Promise<ActionItemDTO> {
    return await this.modifyQuery(
      query,
      this.actionItemModel.findOne(this.merge(itemId, undefined, form)),
    )
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(ActionItemDTO)
  public async findMany(
    query: ResultControlDTO,
    form: FormDTO,
  ): Promise<ActionItemDTO[]> {
    return await this.modifyQuery(
      query,
      this.actionItemModel.find(this.merge(query, undefined, form)),
    )
      .lean()
      .exec();
  }

  // #endregion Public Methods
}
