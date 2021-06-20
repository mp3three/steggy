import { FormCRUD } from '@automagical/contracts';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { FormDTO, ProjectDTO } from '@automagical/contracts/formio-sdk';
import { FetchService } from '@automagical/fetch';
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
    private readonly fetchService: FetchService,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async delete(
    form: FormDTO | string,
    project: ProjectDTO,
  ): Promise<boolean> {
    const result = await this.formModel
      .updateOne(
        this.merge(typeof form === 'string' ? form : form._id, project),
        {
          deleted: Date.now(),
        },
      )
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async update(form: FormDTO, project: ProjectDTO): Promise<FormDTO> {
    const result = await this.formModel
      .updateOne(this.merge(form._id, project), form)
      .exec();
    if (result.ok === 1) {
      return await this.findById(form._id, project);
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
    project: ProjectDTO,
    control?: ResultControlDTO,
  ): Promise<FormDTO> {
    return await this.modifyQuery(
      control,
      this.formModel.findOne(this.merge(form, project, undefined, control)),
    )
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(FormDTO)
  public async findByName(
    form: string,
    project: ProjectDTO,
    control?: ResultControlDTO,
  ): Promise<FormDTO> {
    return await this.modifyQuery(
      control,
      this.formModel.findOne(
        this.merge(
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
        ),
      ),
    )
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(FormDTO)
  public async findMany(
    query: ResultControlDTO = {},
    project: ProjectDTO,
  ): Promise<FormDTO[]> {
    const search = this.modifyQuery(
      query,
      this.formModel.find(this.merge(query, project)),
    );
    return await search.lean().exec();
  }

  // #endregion Public Methods
}
