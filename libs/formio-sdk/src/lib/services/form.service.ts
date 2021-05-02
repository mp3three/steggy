import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { FormDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import { indexOptions, indexQuery } from '@automagical/fetch';
import { FormDocument } from '@automagical/persistence';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class FormService {
  // #region Constructors

  constructor(
    @InjectLogger(FormService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    @InjectModel(FormDTO.name) private readonly formModel: Model<FormDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async byId(formId: string): Promise<FormDTO> {
    return await this.formModel
      .findOne({
        _id: formId,
      })
      .exec();
  }

  @Trace()
  public async create(form: FormDTO, owner?: UserDTO): Promise<FormDTO> {
    form.owner = form.owner || owner?._id;
    return await this.formModel.create(form);
  }

  @Trace()
  public async list(args: {
    query?: Record<string, string>;
    user?: UserDTO;
  }): Promise<{ count: number; items: FormDTO[] }> {
    const query = new Map(Object.entries(args.query || {}));
    let map = indexQuery(query);
    map = indexOptions(query, map);
    const search = Object.fromEntries(map.entries());
    return {
      count: await this.formModel.count(search),
      items: await this.formModel.find(search),
    };
  }

  @Trace()
  public async update(formId: string, form: FormDTO): Promise<FormDTO> {
    // Shame on you
    form._id = formId;
    await this.formModel.updateOne({ _id: formId }, form);
    return form;
  }

  // #endregion Public Methods
}
