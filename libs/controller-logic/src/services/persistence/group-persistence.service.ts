import { BaseMongoService, BaseSchemaDTO } from '@automagical/persistence';
import {
  AutoLogService,
  ResultControlDTO,
  ToClass,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BASIC_STATE, GroupDocument, GroupDTO } from '../../contracts';
const OK_RESPONSE = 1;

@Injectable()
export class GroupPersistenceService extends BaseMongoService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectModel(GroupDTO.name)
    private groupModel: Model<GroupDocument>,
  ) {
    super();
  }

  @Trace()
  @ToClass(GroupDTO)
  public async create<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    state: GroupDTO<GROUP_TYPE>,
  ): Promise<GroupDTO<GROUP_TYPE>> {
    return (
      await this.groupModel.create(state)
    ).toObject() as GroupDTO<GROUP_TYPE>;
  }

  @Trace()
  public async delete(state: GroupDTO | string): Promise<boolean> {
    const query = this.merge(typeof state === 'string' ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    const result = await this.groupModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === OK_RESPONSE;
  }
  @Trace()
  @ToClass(GroupDTO)
  public async findById<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<GroupDTO<GROUP_TYPE>> {
    const query = this.merge(state, control);
    return (await this.modifyQuery(control, this.groupModel.findOne(query))
      .lean()
      .exec()) as GroupDTO<GROUP_TYPE>;
  }

  @Trace()
  @ToClass(GroupDTO)
  public async findByName<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<GroupDTO<GROUP_TYPE>> {
    const query = this.merge(
      {
        filters: new Set([
          {
            field: 'name',
            value: state,
          },
        ]),
      },
      control,
    );
    return (await this.modifyQuery(control, this.groupModel.findOne(query))
      .lean()
      .exec()) as GroupDTO<GROUP_TYPE>;
  }

  @Trace()
  @ToClass(GroupDTO)
  public async findMany<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    control: ResultControlDTO = {},
  ): Promise<GroupDTO<GROUP_TYPE>[]> {
    const query = this.merge(control);
    return (await this.modifyQuery(control, this.groupModel.find(query))
      .lean()
      .exec()) as GroupDTO<GROUP_TYPE>[];
  }

  @Trace()
  public async update<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    state: Omit<Partial<GroupDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<GroupDTO<GROUP_TYPE>> {
    const query = this.merge(id);
    const result = await this.groupModel.updateOne(query, state).exec();
    if (result.ok === OK_RESPONSE) {
      return await this.findById(id);
    }
  }
}