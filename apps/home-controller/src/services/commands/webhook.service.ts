import { forwardRef, Inject } from '@nestjs/common';
import { AutoLogService, FetchService } from '@steggy/boilerplate';
import {
  iRoutineCommand,
  MetadataUpdate,
  PERSON_METADATA_UPDATED,
  PersonService,
  ROOM_METADATA_UPDATED,
  RoomService,
  RoutineCommand,
  SecretsService,
} from '@steggy/controller-sdk';
import {
  RoomMetadataDTO,
  RoutineCommandDTO,
  RoutineCommandWebhookDTO,
} from '@steggy/controller-shared';
import { is, START } from '@steggy/utilities';
import { isDateString, isNumberString } from 'class-validator';
import EventEmitter from 'eventemitter3';
import { get } from 'object-path';

@RoutineCommand({
  description: 'Emit a http request from the controller',
  name: 'Webhook',
  type: 'webhook',
})
export class WebhookService
  implements iRoutineCommand<RoutineCommandWebhookDTO>
{
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: FetchService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    @Inject(forwardRef(() => PersonService))
    private readonly personService: PersonService,
    private readonly eventEmitter: EventEmitter,
    private readonly secretsService: SecretsService,
  ) {}

  public async activate({
    command,
  }: {
    command: RoutineCommandDTO<RoutineCommandWebhookDTO>;
  }): Promise<void> {
    const { assignProperty, assignTo, assignType, objectPath, ...extra } =
      command.command;
    this.logger.debug({ command }, `Sending webhook`);
    let result = await this.fetchService.fetch<string>({
      headers: this.buildHeaders(),
      method: extra.method,
      process: 'text',
      url: extra.url,
    });
    const parse = extra.parse ?? 'none';
    if (parse === 'none') {
      return;
    }
    if (parse === 'json') {
      try {
        const data = JSON.parse(result);
        result = get(data, objectPath);
      } catch (error) {
        this.logger.error({ error }, 'Webhook response parsing failed');
        return;
      }
    }
    const target =
      assignType === 'person'
        ? await this.personService.getWithStates(assignTo)
        : await this.roomService.getWithStates(assignTo);
    if (!target) {
      this.logger.error(`Could not load {${assignType}} {${assignTo}}`);
      return;
    }
    const metadata = target.metadata.find(
      ({ name }) => name === assignProperty,
    );
    if (!metadata) {
      this.logger.error(
        `[${target.friendlyName}] does not have metadata {${assignProperty}}`,
      );
      return;
    }
    const value = this.getValue(result, metadata);
    await (assignType === 'person'
      ? this.personService.update({ metadata: target.metadata }, assignTo)
      : this.roomService.update({ metadata: target.metadata }, assignTo));
    this.logger.debug(`${target.friendlyName}#${assignProperty} = ${target}`);
    this.eventEmitter.emit(
      assignType === 'person' ? PERSON_METADATA_UPDATED : ROOM_METADATA_UPDATED,
      {
        name: assignProperty,
        room: assignTo,
        value,
      } as MetadataUpdate,
    );
  }

  private buildHeaders(
    headers: Record<string, string> = {},
  ): Record<string, string> {
    return Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [
        key,
        this.secretsService.tokenReplace(value),
      ]),
    );
  }

  private coerceBoolean(value: boolean | string | unknown): boolean {
    if (is.boolean(value)) {
      return value;
    }
    if (is.string(value)) {
      if (['true', 'y'].includes(value.toLowerCase())) {
        return true;
      }
      return false;
    }
    return !!value;
  }

  private coerceDate(value: string | Date | unknown): string {
    if (is.string(value) && isDateString(value)) {
      return new Date(value).toISOString();
    }
    if (is.date(value)) {
      return value.toISOString();
    }
    return new Date().toISOString();
  }

  private coerceEnum(value: string | unknown, options: string[]): string {
    if (!is.string(value)) {
      return options[START];
    }
    if (options.includes(value)) {
      return value;
    }
    return options[START];
  }

  private coerceNumber(value: number | string | unknown): number {
    if (is.string(value)) {
      if (isNumberString(value)) {
        return Number(value);
      }
      return Number.parseInt(value);
    }
    if (is.number(value)) {
      return value;
    }
    return Number.NaN;
  }

  private coerceString(value: string | unknown): string {
    if (is.string(value)) {
      return value;
    }
    return String(value);
  }

  private getValue(value: unknown, { type, options }: RoomMetadataDTO) {
    switch (type) {
      case 'boolean':
        return this.coerceBoolean(value);
      case 'string':
        return this.coerceString(value);
      case 'date':
        return this.coerceDate(value);
      case 'enum':
        return this.coerceEnum(value, options);
      case 'number':
        return this.coerceNumber(value);
    }
  }
}
