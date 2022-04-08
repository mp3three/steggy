import { Injectable } from '@nestjs/common';
import { AutoLogService, OnEvent } from '@steggy/boilerplate';
import { DEBUG_LOG } from '@steggy/controller-shared';
import {
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
} from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';

import { ENTITY_METADATA_UPDATED } from '../typings';
import { MetadataService } from './metadata.service';

@Injectable()
export class UpdateLoggerService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly metadataPersistence: MetadataService,
  ) {}

  private entities: string[] = [];

  @OnEvent(ENTITY_METADATA_UPDATED)
  protected async onApplicationBootstrap(): Promise<void> {
    this.entities = await this.metadataPersistence.findWithFlag(DEBUG_LOG);
    if (is.empty(this.entities)) {
      this.logger.info(`No entitites to log changes for`);
      return;
    }
    this.logger.info(`Watching {${this.entities.length}} entities for changes`);
    this.entities.forEach(i => this.logger.debug(` - ${i}`));
  }

  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected onEntityUpdate({ data }: HassEventDTO): void {
    const { new_state } = data;
    if (!this.entities.includes(new_state.entity_id)) {
      return;
    }
    this.logger.debug(
      { ...new_state.attributes },
      `[${new_state.entity_id}] updated {${new_state.state}}`,
    );
  }
}
