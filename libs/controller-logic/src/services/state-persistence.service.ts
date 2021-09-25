import { AutoLogService, ToClass, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RoomStateDocument, RoomStateDTO } from '../contracts';

@Injectable()
export class StatePersistenceService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectModel(RoomStateDTO.name) private catModel: Model<RoomStateDocument>,
  ) {}

  @Trace()
  @ToClass(RoomStateDTO)
  public async create(): Promise<RoomStateDTO> {
    return;
  }
}
