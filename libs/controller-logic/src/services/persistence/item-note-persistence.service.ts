import { BaseMongoService } from '@automagical/persistence';
import {
  AutoLogService,
  ResultControlDTO,
  ToClass,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ItemNoteDocument, ItemNoteDTO } from '../../contracts';

const OK_RESPONSE = 1;

@Injectable()
export class ItemNoteService extends BaseMongoService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectModel(ItemNoteDTO.name)
    private readonly noteModel: Model<ItemNoteDocument>,
  ) {
    super();
  }

  @Trace()
  @ToClass(ItemNoteDTO)
  public async create(state: ItemNoteDTO): Promise<ItemNoteDTO> {
    return (await this.noteModel.create(state)).toObject();
  }

  @Trace()
  public async delete(state: ItemNoteDTO | string): Promise<boolean> {
    const query = this.merge(typeof state === 'string' ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    const result = await this.noteModel
      .updateOne(query, {
        deleted: Date.now(),
      })
      .exec();
    return result.ok === OK_RESPONSE;
  }
  @Trace()
  @ToClass(ItemNoteDTO)
  public async findById(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<ItemNoteDTO> {
    const query = this.merge(state, control);
    return await this.modifyQuery(control, this.noteModel.findOne(query))
      .lean()
      .exec();
  }

  @Trace()
  @ToClass(ItemNoteDTO)
  public async findMany(
    control: ResultControlDTO = {},
  ): Promise<ItemNoteDTO[]> {
    const query = this.merge(control);
    return await this.modifyQuery(control, this.noteModel.find(query))
      .lean()
      .exec();
  }

  @Trace()
  public async update(
    state: ItemNoteDTO,
    control: ResultControlDTO,
  ): Promise<ItemNoteDTO> {
    const query = this.merge(control);
    const result = await this.noteModel.updateOne(query, state).exec();
    if (result.ok === OK_RESPONSE) {
      return await this.findById(state._id, { control });
    }
  }
}
