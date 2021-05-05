import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ActionDTO } from '@automagical/contracts/formio-sdk';
import { ActionDocument } from '@automagical/persistence';
import { InjectLogger, InjectMongo, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ActionService {
  // #region Constructors

  constructor(
    @InjectLogger(ActionService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(ActionDTO)
    private readonly myRoleModel: Model<ActionDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(form: ActionDTO): Promise<ActionDTO> {
    return await this.myRoleModel.create(form);
  }

  @Trace()
  public async delete(role: ActionDTO | string): Promise<boolean> {
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
  public async findById(role: ActionDTO | string): Promise<ActionDTO> {
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
  ): Promise<ActionDTO[]> {
    return await this.myRoleModel
      .find({
        deleted: null,
        ...query,
      })
      .exec();
  }

  @Trace()
  public async hardDelete(role: ActionDTO | string): Promise<boolean> {
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
    source: ActionDTO | string,
    update: Omit<Partial<ActionDTO>, '_id' | 'created'>,
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
