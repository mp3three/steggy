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
import { eachSeries } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { parse } from 'chrono-node';
import dayjs from 'dayjs';
import { Response } from 'node-fetch';
import { get } from 'object-path';

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
  ) {}

  public async activate(
    command: RoutineCommandStopProcessingDTO,
  ): Promise<boolean> {
    let valid = true;
    await eachSeries(command.comparisons, async comparison => {
      if (!valid) {
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
      if (
        (command.mode === 'all' && result === false) ||
        (command.mode === 'any' && result === true)
      ) {
        valid = false;
      }
    });
    return valid;
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
    const [parsed] = parse(comparison.expression);
    if (!parsed) {
      this.logger.error({ comparison }, `Expression failed parsing`);
      return false;
    }
    const now = dayjs();
    // Believe it or not, the docs were written first
    // The logic looks weird in code form
    switch (comparison.dateType) {
      case 'in_range':
        if (parsed.end) {
          return (
            now.isAfter(parsed.start.date()) && now.isBefore(parsed.end.date())
          );
        }
      // fallthrough
      case 'after':
        return now.isBefore(parsed.start.date());
      case 'not_in_range':
        if (parsed.end) {
          return (
            now.isBefore(parsed.start.date()) || now.isAfter(parsed.end.date())
          );
        }
      // fallthrough
      case 'before':
        return now.isAfter(parsed.start.date());
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
