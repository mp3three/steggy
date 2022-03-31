import { AutoLogService, CastResult } from '@automagical/boilerplate';
import { RoutineDTO } from '@automagical/controller-shared';
import { BaseMongoService, QuickConnectModule } from '@automagical/persistence';
import {
  ApplicationManagerService,
  PromptService,
  QuickScript,
} from '@automagical/tty';
import { ResultControlDTO } from '@automagical/utilities';
import { InjectModel } from '@nestjs/mongoose';
import chalk from 'chalk';
import dayjs from 'dayjs';
import { Document, Model } from 'mongoose';

@QuickScript({
  application: Symbol('routine-undelete'),
  imports: QuickConnectModule.forRoot([RoutineDTO]),
})
export class RoutineUndelete extends BaseMongoService {
  constructor(
    @InjectModel(RoutineDTO.name)
    private readonly model: Model<RoutineDTO & Document>,
    private readonly promptService: PromptService,
    private readonly logger: AutoLogService,
    private readonly app: ApplicationManagerService,
  ) {
    super();
  }

  public async exec(): Promise<void> {
    this.app.setHeader('Routine Undelete');
    const list = await this.findMany({
      filters: new Set([
        {
          field: 'deleted',
          operation: 'ne',
          value: null,
        },
      ]),
      sort: ['deleted', 'friendlyName'],
    });
    const restore = await this.promptService.pickMany(
      'Pick routines to restore',
      list.map(project => [
        chalk`{magenta ${project._id}} {red ${dayjs(project.deleted).format(
          'YYYY-MM-DD HH:hh:ss',
        )}} ${project.friendlyName}`,
        project,
      ]),
    );
    const query = this.merge({
      filters: new Set([
        {
          field: '_id',
          operation: 'in',
          value: restore.map(({ _id }) => _id),
        },
      ]),
    });
    const result = await this.model.updateMany(query, { deleted: null });
    this.logger.info(`Restored {${result.modifiedCount}} items`);
  }

  @CastResult(RoutineDTO)
  public async findMany(control: ResultControlDTO = {}): Promise<RoutineDTO[]> {
    const query = this.merge(control);
    return await this.modifyQuery(control, this.model.find(query))
      .lean()
      .exec();
  }
}
