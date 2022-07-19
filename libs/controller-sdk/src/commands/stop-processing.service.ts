import { forwardRef, Inject } from '@nestjs/common';
import {
  AutoLogService,
  FetchService,
  JSONFilterService,
} from '@steggy/boilerplate';
import {
  MetadataComparisonDTO,
  RoutineAttributeComparisonDTO,
  RoutineCommandDTO,
  RoutineCommandStopProcessingDTO,
  RoutineRelativeDateComparisonDTO,
  RoutineStateComparisonDTO,
  RoutineTemplateComparisonDTO,
  RoutineWebhookComparisonDTO,
  STOP_PROCESSING_TYPE,
} from '@steggy/controller-shared';
import {
  EntityManagerService,
  HASocketAPIService,
} from '@steggy/home-assistant';
import { eachSeries, is } from '@steggy/utilities';
import dayjs from 'dayjs';
import { Response } from 'node-fetch';
import { get } from 'object-path';

import { iRoutineCommand, RoutineCommand } from '../decorators';
import { ChronoService, RoomService } from '../services';

@RoutineCommand({
  description: 'Conditionally stop the command sequence.',
  name: 'Stop Processing',
  syncOnly: true,
  type: 'stop_processing',
})
export class StopProcessingCommandService
  implements iRoutineCommand<RoutineCommandStopProcessingDTO>
{
  constructor(
    private readonly entityManager: EntityManagerService,
    private readonly fetch: FetchService,
    private readonly filter: JSONFilterService,
    private readonly logger: AutoLogService,
    @Inject(forwardRef(() => RoomService))
    private readonly room: RoomService,
    private readonly socket: HASocketAPIService,
    private readonly chrono: ChronoService,
  ) {}

  public async activate({
    command,
  }: {
    command: RoutineCommandDTO<RoutineCommandStopProcessingDTO>;
  }): Promise<boolean> {
    const mode = command.command.mode ?? 'any';
    const results: boolean[] = [];
    await eachSeries(command.command.comparisons ?? [], async comparison => {
      // if it's "any", and we got a match, then cut to the chase
      if (mode !== 'all' && results.some(Boolean)) {
        return;
      }
      let result = false;
      switch (comparison.type) {
        case STOP_PROCESSING_TYPE.metadata:
          result = await this.roomMetadata(
            comparison.comparison as MetadataComparisonDTO,
          );
          break;
        case STOP_PROCESSING_TYPE.attribute:
          result = this.attributeComparison(
            comparison.comparison as RoutineAttributeComparisonDTO,
          );
          break;
        case STOP_PROCESSING_TYPE.date:
          result = this.dateComparison(
            comparison.comparison as RoutineRelativeDateComparisonDTO,
          );
          break;
        case STOP_PROCESSING_TYPE.state:
          result = this.stateComparison(
            comparison.comparison as RoutineStateComparisonDTO,
          );
          break;
        case STOP_PROCESSING_TYPE.template:
          result = await this.templateComparison(
            comparison.comparison as RoutineTemplateComparisonDTO,
          );
          break;
        case STOP_PROCESSING_TYPE.webhook:
          result = await this.webhookCompare(
            comparison.comparison as RoutineWebhookComparisonDTO,
          );
      }
      results.push(result);
    });
    // default to "any"
    return (mode === 'all' && results.every(Boolean)) || results.some(Boolean);
  }

  public attributeComparison(
    comparison: RoutineAttributeComparisonDTO,
  ): boolean {
    const entity = this.entityManager.getEntity(comparison.entity_id);
    const attribute = get(entity, comparison.attribute);
    return this.filter.match(
      { attribute },
      { field: 'attribute', ...comparison },
    );
  }

  public dateComparison(comparison: RoutineRelativeDateComparisonDTO): boolean {
    const [start, end] = this.chrono.parse<boolean>(
      comparison.expression,
      false,
    );
    if (is.boolean(start)) {
      return false;
    }

    const now = dayjs();
    // Believe it or not, the docs were written first
    // The logic looks weird in code form
    switch (comparison.dateType || (end ? 'in_range' : 'after')) {
      case 'in_range':
        if (end) {
          return now.isAfter(start) && now.isBefore(end);
        }
      // fallthrough
      case 'before':
        return now.isBefore(start);
      case 'not_in_range':
        if (end) {
          return now.isBefore(start) || now.isAfter(end);
        }
      // fallthrough
      case 'after':
        return now.isAfter(start);
    }
    this.logger.error({ comparison }, `Invalid comparison [dateType]`);
    return false;
  }

  public async roomMetadata(
    comparison: MetadataComparisonDTO,
  ): Promise<boolean> {
    const room = await this.room.getWithStates(comparison.room);
    if (!room) {
      this.logger.error({ comparison }, `Could not find room`);
      return false;
    }
    const property = room.metadata.find(
      ({ name }) => name === comparison.property,
    );
    const value = property?.value;
    return this.filter.match({ value }, { field: 'value', ...comparison });
  }

  public stateComparison(comparison: RoutineStateComparisonDTO): boolean {
    const entity = this.entityManager.getEntity(comparison.entity_id);
    if (is.undefined(entity)) {
      this.logger.error(
        `Failed to load {${comparison.entity_id}} for state comparison`,
      );
      return false;
    }
    return this.filter.match(
      { state: entity.state },
      { field: 'state', ...comparison },
    );
  }

  public async templateComparison(
    comparison: RoutineTemplateComparisonDTO,
  ): Promise<boolean> {
    const value = await this.socket.renderTemplate(comparison.template);
    return this.filter.match({ value }, { field: 'value', ...comparison });
  }

  public async webhookCompare({
    webhook,
    handleAs,
    property,
    ...comparison
  }: RoutineWebhookComparisonDTO): Promise<boolean> {
    try {
      const result = await this.fetch.fetch<Response>({
        headers: Object.fromEntries(
          webhook.headers.map(({ header, value }) => [header, value]),
        ),
        method: webhook.method,
        process: false,
        url: webhook.url,
      });
      const text = await result.text();
      const value =
        handleAs === 'text' ? text : get(JSON.parse(text), property);
      return this.filter.match({ value }, { field: 'value', ...comparison });
    } catch (error) {
      this.logger.error({ error });
      return false;
    }
  }
}
