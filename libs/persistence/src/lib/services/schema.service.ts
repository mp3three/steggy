import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { SchemaDTO } from '@automagical/contracts/formio-sdk';
import { SchemaDocument } from '@automagical/persistence';
import { InjectLogger, InjectMongo, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SchemaService {
  // #region Constructors

  constructor(
    @InjectLogger(SchemaService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(SchemaDTO)
    private readonly myRoleModel: Model<SchemaDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(form: SchemaDTO): Promise<SchemaDTO> {
    return await this.myRoleModel.create(form);
  }

  @Trace()
  public async delete(role: SchemaDTO | string): Promise<boolean> {
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
  public async findById(role: SchemaDTO | string): Promise<SchemaDTO> {
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
  ): Promise<SchemaDTO[]> {
    return await this.myRoleModel
      .find({
        deleted: null,
        ...query,
      })
      .exec();
  }

  @Trace()
  public async hardDelete(role: SchemaDTO | string): Promise<boolean> {
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
    source: SchemaDTO | string,
    update: Omit<Partial<SchemaDTO>, '_id' | 'created'>,
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
