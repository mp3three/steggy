import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { FormDTO, UserDTO } from '@automagical/contracts/formio-sdk';
import { FormDocument } from '@automagical/persistence';
import { InjectLogger, InjectMongo, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class FormService {
  // #region Constructors

  constructor(
    @InjectLogger(FormService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(FormDTO)
    private readonly formModel: Model<FormDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(form: FormDTO, owner?: UserDTO): Promise<FormDTO> {
    form.owner = form.owner || owner?._id;
    return await this.formModel.create(form);
  }

  @Trace()
  public async delete(project: FormDTO | string): Promise<boolean> {
    if (typeof project === 'object') {
      project = project._id;
    }
    const result = await this.formModel
      .updateOne(
        { _id: project },
        {
          deleted: Date.now(),
        },
      )
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async findById(form: FormDTO | string): Promise<FormDTO> {
    if (typeof form === 'object') {
      form = form._id;
    }
    return await this.formModel.findOne({
      _id: form,
      deleted: null,
    });
  }

  @Trace()
  public async findByName(form: FormDTO | string): Promise<FormDTO> {
    if (typeof form === 'object') {
      form = form.name;
    }
    return await this.formModel.findOne({
      deleted: null,
      name: form,
    });
  }

  @Trace()
  public async findMany(
    query: Record<string, unknown> = {},
  ): Promise<FormDTO[]> {
    return await this.formModel
      .find({
        deleted: null,
        ...query,
      })
      .exec();
  }

  @Trace()
  public async hardDelete(project: FormDTO | string): Promise<boolean> {
    if (typeof project === 'object') {
      project = project._id;
    }
    const result = await this.formModel.deleteOne({
      _id: project,
    });
    return result.ok === 1;
  }

  @Trace()
  public async update(
    source: FormDTO | string,
    update: Omit<Partial<FormDTO>, '_id' | 'created'>,
  ): Promise<boolean> {
    if (typeof source === 'object') {
      source = source._id;
    }
    const result = await this.formModel
      .updateOne({ _id: source, deleted: null }, update)
      .exec();
    return result.ok === 1;
  }

  // #endregion Public Methods
}
