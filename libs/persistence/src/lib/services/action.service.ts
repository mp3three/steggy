import { ActionCRUD } from '@automagical/contracts';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { ActionDTO, FormDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@automagical/utilities';
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
    // 🦸‍♀️
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
    form: FormDTO,
  ): Promise<boolean> {
    const result = await this.actionModel
      .updateOne(
        this.merge(
          typeof action === 'string' ? action : action._id,
          undefined,
          form,
        ),
        {
          deleted: Date.now(),
        },
      )
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update(action: ActionDTO, form: FormDTO): Promise<ActionDTO> {
    const result = await this.actionModel
      .updateOne(this.merge(action._id, undefined, form), action)
      .exec();
    if (result.ok === 1) {
      return await this.findById(action._id, form);
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
    form: FormDTO | string,
    query?: ResultControlDTO,
  ): Promise<ActionDTO> {
    return await this.modifyQuery(
      query,
      this.actionModel.findOne(this.merge(action, undefined, form, query)),
    )
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(ActionDTO)
  public async findMany(
    query: ResultControlDTO,
    form: FormDTO,
  ): Promise<ActionDTO[]> {
    return await this.modifyQuery(
      query,
      this.actionModel.find(this.merge(query, undefined, form)),
    )
      .lean()
      .exec();
  }

  // #endregion Public Methods
}
