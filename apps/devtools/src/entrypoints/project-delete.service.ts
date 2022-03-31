import { AutoLogService, CastResult } from '@automagical/boilerplate';
import { ProjectDTO } from '@automagical/formio';
import { BaseMongoService, QuickConnectModule } from '@automagical/persistence';
import {
  ApplicationManagerService,
  PromptService,
  QuickScript,
} from '@automagical/tty';
import { ResultControlDTO } from '@automagical/utilities';
import { InjectModel } from '@nestjs/mongoose';
import chalk from 'chalk';
import { Document, Model } from 'mongoose';

@QuickScript({
  OVERRIDE_DEFAULTS: {
    libs: { tty: { DEFAULT_HEADER_FONT: 'Pagga' } },
  },
  application: Symbol('project-delete'),
  imports: QuickConnectModule.forRoot([ProjectDTO]),
})
export class ProjectDelete extends BaseMongoService {
  constructor(
    @InjectModel(ProjectDTO.name)
    private readonly model: Model<ProjectDTO & Document>,
    private readonly promptService: PromptService,
    private readonly logger: AutoLogService,
    private readonly app: ApplicationManagerService,
  ) {
    super();
  }

  public async exec(): Promise<void> {
    this.app.setHeader('Project Cleanup');
    const list = await this.findMany();
    const remove = await this.promptService.pickMany(
      'Pick projects to remove',
      list.map(project => [
        chalk`{magenta ${project._id}} ${project.title}`,
        project,
      ]),
    );
    const result = await this.model.updateMany(
      this.merge({
        filters: new Set([
          {
            field: '_id',
            operation: 'in',
            value: [remove.map(({ _id }) => _id)],
          },
        ]),
      }),
      { deleted: Date.now() },
    );
    this.logger.info(`Removed {${result.modifiedCount}} items`);
  }

  @CastResult(ProjectDTO)
  public async findMany(control: ResultControlDTO = {}): Promise<ProjectDTO[]> {
    const query = this.merge(control);
    const out = await this.modifyQuery(control, this.model.find(query))
      .lean()
      .exec();
    return out;
  }
}
