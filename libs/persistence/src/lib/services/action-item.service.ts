import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ActionItemDTO } from '@automagical/contracts/formio-sdk';
import { ActionItemDocument } from '@automagical/persistence';
import { InjectLogger, InjectMongo, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ActionItemService {
  // #region Constructors

  constructor(
    @InjectLogger(ActionItemService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(ActionItemDTO)
    private readonly myRoleModel: Model<ActionItemDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(form: ActionItemDTO): Promise<ActionItemDTO> {
    return await this.myRoleModel.create(form);
  }

  @Trace()
  public async delete(role: ActionItemDTO | string): Promise<boolean> {
    if (typeof role === 'object') {
      role = role._id;
    }
    const result = await this.myRoleModel
      .updateOne(
        { _id: role },
        {
          deleted: Date.now(),
        },
      )
      .exec();
    return result.ok === 1;
  }

  @Trace()
  public async findById(role: ActionItemDTO | string): Promise<ActionItemDTO> {
    if (typeof role === 'object') {
      role = role._id;
    }
    return await this.myRoleModel.findOne({
      _id: role,
      deleted: null,
    });
  }

  @Trace()
  public async findMany(
    query: Record<string, unknown> = {},
  ): Promise<ActionItemDTO[]> {
    return await this.myRoleModel
      .find({
        deleted: null,
        ...query,
      })
      .exec();
  }

  @Trace()
  public async hardDelete(role: ActionItemDTO | string): Promise<boolean> {
    if (typeof role === 'object') {
      role = role._id;
    }
    const result = await this.myRoleModel.deleteOne({
      _id: role,
    });
    return result.ok === 1;
  }

  @Trace()
  public async update(
    source: ActionItemDTO | string,
    update: Omit<Partial<ActionItemDTO>, '_id' | 'created'>,
  ): Promise<boolean> {
    if (typeof source === 'object') {
      source = source._id;
    }
    const result = await this.myRoleModel
      .updateOne({ _id: source, deleted: null }, update)
      .exec();
    return result.ok === 1;
  }

  // #endregion Public Methods
}
