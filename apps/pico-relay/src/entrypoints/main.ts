import {
  AutoLogService,
  FetchService,
  InjectConfig,
  OnEvent,
  QuickScript,
} from '@steggy/boilerplate';
import { is } from '@steggy/utilities';

import {
  HOMEASSISTANT_TOKEN,
  HOMEASSISTANT_URL,
  LUTRON_HOST,
  LUTRON_PASSWORD,
  LUTRON_PORT,
  LUTRON_USERNAME,
  PICO_MAPPINGS,
  RECONNECT_INTERVAL,
} from '../config';
import { LutronClientService } from '../services';
import { LUTRON_EVENT } from '../types/constants';

enum PicoDirection {
  down = '3',
  up = '4',
}
enum PicoButtons {
  none = '0',
  on = '2',
  dimUp = '5',
  favorite = '3',
  dimDown = '6',
  off = '4',
}
const translation = new Map([
  [PicoButtons.none, 'none'],
  [PicoButtons.on, 'on'],
  [PicoButtons.dimUp, 'dimUp'],
  [PicoButtons.favorite, 'favorite'],
  [PicoButtons.dimDown, 'dimDown'],
  [PicoButtons.off, 'off'],
]);

@QuickScript({
  application: Symbol('pico-relay'),
  configuration: {
    [HOMEASSISTANT_TOKEN]: {
      description: 'Long lived access token',
      type: 'string',
    },
    [HOMEASSISTANT_URL]: {
      default: 'http://localhost:8123',
      description: 'Homeassistant api target',
      type: 'string',
    },
    [LUTRON_HOST]: {
      description: 'Connection host',
      type: 'string',
    },
    [LUTRON_PASSWORD]: {
      default: 'integration',
      description: 'Authentication password',
      type: 'string',
    },
    [LUTRON_PORT]: {
      default: 23,
      description: 'Connection port',
      type: 'number',
    },
    [LUTRON_USERNAME]: {
      default: 'lutron',
      description: 'Authentication username',
      type: 'string',
    },

    [PICO_MAPPINGS]: {
      default: {},
      description:
        'id=sensor.entity_id, only mapped items are sent to home assistant',
      type: 'record',
    },
    [RECONNECT_INTERVAL]: {
      default: 5000,
      description: 'Reconnect interval on dropped connection',
      type: 'number',
    },
  },
  providers: [LutronClientService],
})
export class PicoRelay {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(PICO_MAPPINGS)
    private readonly mappings: Record<string, string>,
    @InjectConfig(HOMEASSISTANT_TOKEN) private readonly token: string,
    @InjectConfig(HOMEASSISTANT_URL) private readonly url: string,
    private readonly fetchService: FetchService,
  ) {}

  @OnEvent(LUTRON_EVENT)
  protected async onEvent(line: string): Promise<void> {
    // Example line
    // ~DEVICE,13,4,3
    const [action, id, button, direction] = line.split(',') as [
      string,
      string,
      PicoButtons,
      PicoDirection,
    ];
    this.logger.debug({ action, button, direction, id });
    if (!this.mappings[id]) {
      return;
    }
    const resolved =
      direction !== PicoDirection.down ? PicoButtons.none : button;
    const translated = translation.get(
      direction !== PicoDirection.down ? PicoButtons.none : button,
    );
    if (is.empty(translated)) {
      this.logger.error(`Unknown argument: {${button}}`);
      return;
    }
    await this.syncHomeAssistant(this.mappings[id], translated, resolved);
  }

  private async syncHomeAssistant(
    entity_id: string,
    translated: string,
    state: string,
  ): Promise<void> {
    if (!this.token) {
      return;
    }
    this.logger.info(`[${entity_id}] sending state {${state}}`);
    await this.fetchService.fetch({
      baseUrl: this.url,
      bearer: this.token,
      body: { attributes: { translated }, state },
      method: 'post',
      url: `/api/states/${entity_id}`,
    });
  }
}
