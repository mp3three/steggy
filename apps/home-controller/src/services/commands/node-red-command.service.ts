import { InternalServerErrorException } from '@nestjs/common';
import {
  AutoLogService,
  FetchService,
  InjectConfig,
} from '@steggy/boilerplate';
import { iRoutineCommand, RoutineCommand } from '@steggy/controller-sdk';
import {
  RoutineCommandDTO,
  RoutineCommandNodeRedDTO,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';

import { NODE_RED_URL } from '../../config';

@RoutineCommand({
  description: 'Activate a node in Node Red',
  name: 'Node Red',
  type: 'node_red',
})
export class NodeRedCommand
  implements iRoutineCommand<RoutineCommandNodeRedDTO>
{
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetch: FetchService,
    @InjectConfig(NODE_RED_URL) private readonly nodeRed: string,
  ) {
    this.fetch.BASE_URL = this.nodeRed;
  }

  public async activate({
    command,
  }: {
    command: RoutineCommandDTO<RoutineCommandNodeRedDTO>;
  }): Promise<void> {
    if (is.empty(this.nodeRed)) {
      throw new InternalServerErrorException(`NodeRed not configured`);
    }
    this.logger.debug(`Attempting to activate node [${command.command.name}]`);
    const result = await this.fetch.fetch<{ success: boolean }>({
      method: 'post',
      url: `/steggy/routine-command/${command.command.name}`,
    });
    this.logger.debug({ result });
  }

  public async listAvailable(): Promise<Record<'id' | 'name', string>[]> {
    if (is.empty(this.nodeRed)) {
      throw new InternalServerErrorException(`NodeRed not configured`);
    }
    const { list } = await this.fetch.fetch<{
      list: Record<'id' | 'name', string>[];
    }>({
      url: `/steggy/routine-command`,
    });
    return list;
  }

  protected onModuleInit(): void {
    if (is.empty(this.nodeRed)) {
      this.logger.debug(
        `No url provided, outgoing NodeRed commands not usable`,
      );
      return;
    }
    this.logger.info(`NodeRed target url provided`);
  }
}
