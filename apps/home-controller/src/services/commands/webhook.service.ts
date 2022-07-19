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
  VMService,
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
    private readonly fetch: FetchService,
    @Inject(forwardRef(() => RoomService))
    private readonly room: RoomService,
    @Inject(forwardRef(() => PersonService))
    private readonly person: PersonService,
    private readonly eventEmitter: EventEmitter,
    private readonly vm: VMService,
    private readonly secrets: SecretsService,
  ) {}

  public async activate({
    command,
  }: {
    command: RoutineCommandDTO<RoutineCommandWebhookDTO>;
  }): Promise<boolean> {
    const { assignProperty, assignTo, assignType, objectPath, url, ...extra } =
      command.command;
    // * Validation:
    // - Make sure a URL is defined
    if (is.empty(url)) {
      this.logger.error({ command }, `URL not provided`);
      return false;
    }
    // * Send request
    this.logger.debug({ command }, `Sending webhook`);
    let result = await this.fetch.fetch<string>({
      headers: Object.fromEntries(
        extra.headers.map(({ header, value }) => [
          header,
          this.secrets.tokenReplace(value),
        ]),
      ),
      method: extra.method,
      process: 'text',
      url: this.secrets.tokenReplace(url),
    });
    const parse = extra.parse ?? 'none';
    if (assignTo === 'none') {
      return false;
    }
    if (parse === 'json') {
      try {
        const data = JSON.parse(result);
        // * Empty object path = whole object
        result = is.empty(objectPath) ? data : get(data, objectPath);
      } catch (error) {
        this.logger.error({ error }, 'Webhook response parsing failed');
        return false;
      }
    }
    // * Process
    if (assignTo === 'eval') {
      let stop = false;
      await this.vm.command(command.command.code, {
        // ? should be possible to access the raw response headers?
        response: result,
        stop_processing: () => (stop = true),
      });
      return stop;
    }
    // * Assign information to a person / room metadata
    const target =
      assignType === 'person'
        ? await this.person.load(assignTo)
        : await this.room.load(assignTo);
    if (!target) {
      this.logger.error(`Could not load {${assignType}} {${assignTo}}`);
      return false;
    }
    const metadata = target.metadata.find(
      ({ name }) => name === assignProperty,
    );
    if (!metadata) {
      this.logger.error(
        `[${target.friendlyName}] does not have metadata {${assignProperty}}`,
      );
      return false;
    }
    // Make sure the value is what we think it should be
    const value = this.getValue(result, metadata);
    await (assignType === 'person'
      ? this.person.update({ metadata: target.metadata }, assignTo)
      : this.room.update({ metadata: target.metadata }, assignTo));
    this.logger.debug(`${target.friendlyName}#${assignProperty} = ${target}`);

    // Announce the change
    // This may trigger additional routines
    process.nextTick(() => {
      this.eventEmitter.emit(
        assignType === 'person'
          ? PERSON_METADATA_UPDATED
          : ROOM_METADATA_UPDATED,
        {
          name: assignProperty,
          room: assignTo,
          value,
        } as MetadataUpdate,
      );
    });
    return false;
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
