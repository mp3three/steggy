import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  AutoLogService,
  FetchService,
  InjectConfig,
} from '@steggy/boilerplate';
import { RoutineCommandNodeRedDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';

import { NODE_RED_URL } from '../../config';

@Injectable()
export class NodeRedCommand {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: FetchService,
    @InjectConfig(NODE_RED_URL) private readonly nodeRed: string,
  ) {
    this.fetchService.BASE_URL = this.nodeRed;
  }

  public async activate(command: RoutineCommandNodeRedDTO): Promise<void> {
    if (is.empty(this.nodeRed)) {
      throw new InternalServerErrorException(`NodeRed not configured`);
    }
    this.logger.debug(`Attempting to activate node [${command.name}]`);
    const result = await this.fetchService.fetch<{ success: boolean }>({
      method: 'post',
      url: `/steggy/routine-command/${command.name}`,
    });
    this.logger.debug({ result });
  }

  public async listAvailable(): Promise<string[]> {
    if (is.empty(this.nodeRed)) {
      throw new InternalServerErrorException(`NodeRed not configured`);
    }
    return await this.fetchService.fetch<string[]>({
      url: `/steggy/routine-command`,
    });
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
