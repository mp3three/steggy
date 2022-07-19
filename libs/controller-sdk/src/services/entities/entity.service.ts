import { Injectable } from '@nestjs/common';
import {
  AutoLogService,
  JSONFilterService,
  OnEvent,
} from '@steggy/boilerplate';
import { IGNORE_ENTITY } from '@steggy/controller-shared';
import { EntityManagerService } from '@steggy/home-assistant';
import { HassStateDTO } from '@steggy/home-assistant-shared';
import { is, ResultControlDTO } from '@steggy/utilities';

import { ENTITY_METADATA_UPDATED } from '../../typings';
import { MetadataService } from '../metadata.service';

@Injectable()
export class EntityService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly metadata: MetadataService,
    private readonly jsonFilter: JSONFilterService,
  ) {}

  private IGNORED_ENTITIES = new Set<string>();

  public list(control: ResultControlDTO = {}): HassStateDTO[] {
    return this.jsonFilter.query(
      control,
      [...this.entityManager.ENTITIES.values()].filter(
        i => is.object(i) && !this.IGNORED_ENTITIES.has(i.entity_id),
      ),
    );
  }

  protected async onModuleInit(): Promise<void> {
    await this.loadIgnored();
  }

  @OnEvent(ENTITY_METADATA_UPDATED(IGNORE_ENTITY))
  private async loadIgnored(): Promise<void> {
    const list = await this.metadata.findWithFlag(IGNORE_ENTITY);
    this.IGNORED_ENTITIES = new Set(list);
    this.logger.info(`Ignoring {${list.length}} entities`);
    list.forEach(id => this.logger.debug(` - {${id}}`));
  }
}
