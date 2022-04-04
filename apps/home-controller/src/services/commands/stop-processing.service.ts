import {
  AutoLogService,
  FetchService,
  JSONFilterService,
} from '@automagical/boilerplate';
import {
  RoomMetadataComparisonDTO,
  RoutineAttributeComparisonDTO,
  RoutineCommandStopProcessingDTO,
  RoutineRelativeDateComparisonDTO,
  RoutineStateComparisonDTO,
  RoutineTemplateComparisonDTO,
  RoutineWebhookComparisonDTO,
  STOP_PROCESSING_TYPE,
} from '@automagical/controller-shared';
import {
  EntityManagerService,
  HASocketAPIService,
} from '@automagical/home-assistant';
import { eachSeries, is } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { Response } from 'node-fetch';
import { get } from 'object-path';

import { ChronoService } from '../chrono.service';
import { RoomService } from '../room.service';

@Injectable()
export class StopProcessingCommandService {
  constructor(
    private readonly entityManager: EntityManagerService,
    private readonly fetchService: FetchService,
    private readonly filterService: JSONFilterService,
    private readonly logger: AutoLogService,
    private readonly roomService: RoomService,
    private readonly socketService: HASocketAPIService,
    private readonly chronoService: ChronoService,
  ) {}

  public async activate(
    command: RoutineCommandStopProcessingDTO,
  ): Promise<boolean> {
    const results: boolean[] = [];
    await eachSeries(command.comparisons ?? [], async comparison => {
      // if it's "any", and we got a match, then cut to the chase
      if (command.mode !== 'all' && results.some(i => i)) {
        return;
      }
      let result = false;
      switch (comparison.type) {
        case STOP_PROCESSING_TYPE.room_metadata:
          result = await this.roomMetadata(
            comparison.comparison as RoomMetadataComparisonDTO,
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
    return (
      (command.mode === 'all' && results.every(i => i)) || results.some(i => i)
    );
  }

  private attributeComparison(
    comparison: RoutineAttributeComparisonDTO,
  ): boolean {
    const entity = this.entityManager.getEntity(comparison.entity_id);
    const attribute = get(entity, comparison.attribute);
    return this.filterService.match(
      { attribute },
      { field: 'attribute', ...comparison },
    );
  }

  private dateComparison(
    comparison: RoutineRelativeDateComparisonDTO,
  ): boolean {
    const [start, end] = this.chronoService.parse<boolean>(
      comparison.expression,
      false,
    );
    if (is.boolean(start)) {
      return false;
    }
    const now = dayjs();
    // Believe it or not, the docs were written first
    // The logic looks weird in code form
    switch (comparison.dateType) {
      case 'in_range':
        if (end) {
          return now.isAfter(start) && now.isBefore(end);
        }
      // fallthrough
      case 'after':
        return now.isBefore(start);
      case 'not_in_range':
        if (end) {
          return now.isBefore(start) || now.isAfter(end);
        }
      // fallthrough
      case 'before':
        return now.isAfter(start);
    }
    this.logger.error({ comparison }, `Invalid comparison [dateType]`);
    return false;
  }

  private async roomMetadata(
    comparison: RoomMetadataComparisonDTO,
  ): Promise<boolean> {
    const room = await this.roomService.get(comparison.room);
    if (!room) {
      this.logger.error({ comparison }, `Could not find room`);
      return false;
    }
    const property = room.metadata.find(
      ({ name }) => name === comparison.property,
    );
    const value = property?.value;
    return this.filterService.match(
      { value },
      { field: 'value', ...comparison },
    );
  }

  private stateComparison(comparison: RoutineStateComparisonDTO): boolean {
    const entity = this.entityManager.getEntity(comparison.entity_id);
    if (is.undefined(entity)) {
      this.logger.error(
        `Failed to load {${comparison.entity_id}} for state comparison`,
      );
      return false;
    }
    return this.filterService.match(
      { state: entity.state },
      { field: 'state', ...comparison },
    );
  }

  private async templateComparison(
    comparison: RoutineTemplateComparisonDTO,
  ): Promise<boolean> {
    const value = await this.socketService.renderTemplate(comparison.template);
    return this.filterService.match(
      { value },
      { field: 'value', ...comparison },
    );
  }

  private async webhookCompare({
    webhook,
    handleAs,
    property,
    ...comparison
  }: RoutineWebhookComparisonDTO): Promise<boolean> {
    try {
      const result = await this.fetchService.fetch<Response>({
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
      return this.filterService.match(
        { value },
        { field: 'value', ...comparison },
      );
    } catch (error) {
      this.logger.error({ error });
      return false;
    }
  }
}
