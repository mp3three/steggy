import { ActionCRUD, CrudOptions } from '@formio/contracts';
import { LIB_PERSISTENCE } from '@formio/contracts/constants';
import { ResultControlDTO } from '@formio/contracts/fetch';
import { ActionDTO } from '@formio/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@formio/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { ActionDocument } from '../schema';
import { BaseMongoService } from './base-mongo.service';

@Injectable()
export class ActionPersistenceMongoService
  extends BaseMongoService
  implements ActionCRUD
{
  // #region Constructors

  constructor(
    @InjectLogger(ActionPersistenceMongoService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(ActionDTO)
    private readonly actionModel: Model<ActionDocument>,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async delete(
    action: ActionDTO | string,
    { form }: CrudOptions,
  ): Promise<boolean> {
    const query = this.merge(
      typeof action === 'string' ? action : action._id,
      undefined,
      form,
    );
    this.logger.debug({ query }, `delete query`);
    const result = await this.actionModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update(
    action: ActionDTO,
    options: CrudOptions,
  ): Promise<ActionDTO> {
    const query = this.merge(action._id, undefined, options.form);
    this.logger.debug({ action, query }, `update query`);
    const result = await this.actionModel.updateOne(query, action).exec();
    if (result.ok === 1) {
      return await this.findById(action._id, options);
    }
  }

  @Trace()
  @ToClass(ActionDTO)
  public async create(form: ActionDTO): Promise<ActionDTO> {
    return (await this.actionModel.create(form)).toObject();
  }

  @Trace()
  @ToClass(ActionDTO)
  public async findById(
    action: string,
    { form, control }: CrudOptions,
  ): Promise<ActionDTO> {
    const query = this.merge(action, undefined, form, control);
    this.logger.debug({ query }, `findById query`);
    return await this.modifyQuery(control, this.actionModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(ActionDTO)
  public async findMany(
    constrol: ResultControlDTO,
    { form }: CrudOptions,
  ): Promise<ActionDTO[]> {
    const query = this.merge(constrol, undefined, form);
    this.logger.debug({ query }, `findMany query`);
    return await this.modifyQuery(constrol, this.actionModel.find(query))
      .lean()
      .exec();
  }

  // #endregion Public Methods
}
