// ManualEntityCommandDTO

import { AutoLogService } from '@steggy/boilerplate';
import {
  ChronoService,
  iRoutineCommand,
  MathService,
  RoutineCommand,
  VMService,
} from '@steggy/controller-sdk';
import {
  CallServiceCommandAttribute,
  CallServiceCommandDTO,
  RoutineCommandDTO,
} from '@steggy/controller-shared';
import { HACallService, HASocketAPIService } from '@steggy/home-assistant';
import { domain as getDomain } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import { each } from 'async';

@RoutineCommand({
  description:
    'Execute a command against a device through the home assistant api',
  name: 'Call Service',
  type: 'call_service',
})
// ServiceServiceServiceServiceService
export class CallServiceService
  implements iRoutineCommand<CallServiceCommandDTO>
{
  constructor(
    private readonly logger: AutoLogService,
    private readonly call: HACallService,
    private readonly vm: VMService,
    private readonly socket: HASocketAPIService,
    private readonly chrono: ChronoService,
    private readonly math: MathService,
  ) {}

  public async activate({
    command,
    waitForChange,
  }: {
    command: RoutineCommandDTO<CallServiceCommandDTO>;
    waitForChange: boolean;
  }): Promise<void> {
    const {
      command: {
        service,
        domain,
        entity_id,
        attributes = {},
        set_attributes = [],
      },
    } = command;
    if (is.empty(entity_id)) {
      this.logger.error({ command }, `{entity_id} not provided`);
      return;
    }
    if (is.empty(service)) {
      this.logger.error({ command }, `{service} not provided`);
      return;
    }
    const filtered = await this.buildAttributes(attributes, set_attributes);
    const service_data = { ...filtered, entity_id };
    this.logger.debug({ service_data }, `[${entity_id}] {${service}}`);

    await this.call.call(
      service,
      service_data,
      domain || getDomain(entity_id),
      waitForChange,
    );
  }

  private async buildAttributes(
    attributes: Record<string, CallServiceCommandAttribute>,
    set_attributes: string[],
  ): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {};
    await each(Object.entries(attributes), async ([key, { type, value }]) => {
      if (!set_attributes.includes(key)) {
        return;
      }
      type ||= 'simple';
      if (type === 'eval') {
        out[key] = await this.vm.fetch(value as string);
        return;
      }
      if (type === 'template') {
        out[key] = await this.socket.renderTemplate(value as string);
        return;
      }
      if (type === 'simple') {
        out[key] = value;
        return;
      }
      if (type === 'math') {
        out[key] = await this.math.exec(value as string);
        return;
      }
      if (type === 'chrono') {
        const [start] = await this.chrono.parse(value as string);
        if (is.date(start)) {
          out[key] = start;
        }
        return;
      }
      this.logger.error(`Unknown type {${type}}`);
    });
    return out;
  }
}
