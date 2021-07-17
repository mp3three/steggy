import { ActionItemCRUD } from '@formio/contracts';
import { LIB_PERSISTENCE } from '@formio/contracts/constants';
import { ResultControlDTO } from '@formio/contracts/fetch';
import { ActionItemDTO, FormDTO } from '@formio/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@formio/utilities';
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
    const query = this.merge(item._id, undefined, form);
    this.logger.debug({ query }, 'delete query');
    const result = await this.actionItemModel
      .updateOne(query, {
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
    const query = this.merge(item._id, undefined, form);
    this.logger.debug({ item, query }, 'delete query');
    const result = await this.actionItemModel.updateOne(query, item).exec();
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
    control?: ResultControlDTO,
  ): Promise<ActionItemDTO> {
    const query = this.merge(itemId, undefined, form);
    this.logger.debug({ query }, `findById query`);
    return await this.modifyQuery(control, this.actionItemModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(ActionItemDTO)
  public async findMany(
    control: ResultControlDTO,
    form: FormDTO,
  ): Promise<ActionItemDTO[]> {
    const query = this.merge(control, undefined, form);
    this.logger.debug({ query }, `findManyQuery`);
    return await this.modifyQuery(control, this.actionItemModel.find(query))
      .lean()
      .exec();
  }

  // #endregion Public Methods
}
