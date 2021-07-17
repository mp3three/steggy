import { CrudOptions, FormCRUD } from '@automagical/contracts';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { FormDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { FormDocument } from '../schema';
import { BaseMongoService } from './base-mongo.service';

@Injectable()
export class FormPersistenceMongoService
  extends BaseMongoService
  implements FormCRUD
{
  // #region Constructors

  constructor(
    @InjectLogger(FormPersistenceMongoService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(FormDTO)
    private readonly formModel: Model<FormDocument>,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async delete(
    form: FormDTO | string,
    { project }: CrudOptions,
  ): Promise<boolean> {
    const query = this.merge(
      typeof form === 'string' ? form : form._id,
      project,
    );
    this.logger.debug({ query }, `delete query`);
    const result = await this.formModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update(
    form: FormDTO,
    { project }: CrudOptions,
  ): Promise<FormDTO> {
    const query = this.merge(form._id, project);
    this.logger.debug({ form, query }, `update query`);
    const result = await this.formModel.updateOne(query, form).exec();
    if (result.ok === 1) {
      return await this.findById(form._id, { project });
    }
  }

  @Trace()
  @ToClass(FormDTO)
  public async create(form: FormDTO): Promise<FormDTO> {
    return (await this.formModel.create(form)).toObject();
  }

  @Trace()
  @ToClass(FormDTO)
  public async findById(
    form: string,
    { project, control }: CrudOptions,
  ): Promise<FormDTO> {
    const query = this.merge(form, project, undefined, control);
    this.logger.debug({ query }, `findById query`);
    return await this.modifyQuery(control, this.formModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(FormDTO)
  public async findByName(
    form: string,
    { project, control }: CrudOptions,
  ): Promise<FormDTO> {
    const query = this.merge(
      {
        filters: new Set([
          {
            field: 'name',
            value: form,
          },
        ]),
      },
      project,
      undefined,
      control,
    );
    this.logger.debug({ query }, `findByName query`);
    return await this.modifyQuery(control, this.formModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(FormDTO)
  public async findMany(
    control: ResultControlDTO = {},
    { project }: CrudOptions,
  ): Promise<FormDTO[]> {
    const query = this.merge(control, project);
    this.logger.debug({ query }, `findMany query`);
    const search = this.modifyQuery(control, this.formModel.find(query));
    return await search.lean().exec();
  }

  // #endregion Public Methods
}
