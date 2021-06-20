import { SchemaCRUD } from '@automagical/contracts';
import { LIB_PERSISTENCE, SCHEMA_KEYS } from '@automagical/contracts/constants';
import { SchemaDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, InjectMongo, ToClass, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { SchemaDocument } from '../schema';
import { BaseMongoService } from './base-mongo.service';

@Injectable()
export class SchemaPersistenceMongoService
  extends BaseMongoService
  implements SchemaCRUD
{
  // #region Constructors

  constructor(
    @InjectLogger(SchemaPersistenceMongoService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    @InjectMongo(SchemaDTO)
    private readonly schemaModel: Model<SchemaDocument>,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  @ToClass(SchemaDTO)
  public async create(key: SCHEMA_KEYS, value: string): Promise<string> {
    const schema = await this.schemaModel.create({
      key,
      value,
    });
    return schema.value;
  }

  @Trace()
  @ToClass(SchemaDTO)
  public async find(key: SCHEMA_KEYS): Promise<string> {
    const schema = await this.schemaModel
      .findOne({
        key: key,
      })
      .lean()
      .exec();
    return schema?.value;
  }

  public async update(key: SCHEMA_KEYS, value: string): Promise<string> {
    await this.schemaModel.updateOne(
      {
        key: key,
      },
      {
        $set: {
          value: value,
        },
      },
    );
    return value;
  }

  // #endregion Public Methods
}
