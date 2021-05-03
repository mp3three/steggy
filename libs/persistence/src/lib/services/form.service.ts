import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { SubmissionDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import { indexOptions, indexQuery } from '@automagical/fetch';
import { FormDocument } from '@automagical/persistence';
import { InjectLogger, InjectMongo, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class FormService {
  // #region Constructors

  constructor(
    @InjectLogger(FormService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    @InjectMongo(SubmissionDTO)
    private readonly formModel: Model<FormDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async byId(formId: string): Promise<SubmissionDTO> {
    return await this.formModel
      .findOne({
        _id: formId,
      })
      .exec();
  }

  @Trace()
  public async create(
    form: SubmissionDTO,
    owner?: UserDTO,
  ): Promise<SubmissionDTO> {
    form.owner = form.owner || owner?._id;
    return await this.formModel.create(form);
  }

  @Trace()
  public async list(arguments_: {
    query?: Record<string, string>;
    user?: UserDTO;
  }): Promise<{ count: number; items: SubmissionDTO[] }> {
    const query = new Map(Object.entries(arguments_.query || {}));
    let map = indexQuery(query);
    map = indexOptions(query, map);
    const search = Object.fromEntries(map.entries());
    return {
      count: await this.formModel.count(search),
      items: await this.formModel.find(search),
    };
  }

  @Trace()
  public async update(
    formId: string,
    form: SubmissionDTO,
  ): Promise<SubmissionDTO> {
    // Shame on you
    form._id = formId;
    await this.formModel.updateOne({ _id: formId }, form);
    return form;
  }

  // #endregion Public Methods
}
