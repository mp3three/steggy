import { Provider } from '@nestjs/common';
import { LibraryModule } from '@steggy/boilerplate';

import {
  BASE_URL,
  CRASH_REQUESTS_PER_SEC,
  LIB_HOME_ASSISTANT,
  RENDER_TIMEOUT,
  RETRY_INTERVAL,
  TOKEN,
  WARN_REQUESTS_PER_SEC,
  WEBSOCKET_URL,
} from '../config';
import {
  CameraDomainService,
  ClimateDomainService,
  CoverDomainService,
  FanDomainService,
  HomeAssistantCoreService,
  HumidifierDomain,
  iCloudDomainService,
  LightDomainService,
  LockDomainService,
  MediaPlayerDomainService,
  NotifyDomainService,
  RemoteDomainService,
  SwitchDomainService,
} from '../domains';
import {
  DeviceService,
  EntityManagerService,
  HACallService,
  HASocketAPIService,
  HomeAssistantFetchAPIService,
  TriggerService,
} from '../services';

const services: Provider[] = [
  ...[
    CameraDomainService,
    ClimateDomainService,
    CoverDomainService,
    FanDomainService,
    HomeAssistantCoreService,
    HumidifierDomain,
    iCloudDomainService,
    LightDomainService,
    LockDomainService,
    MediaPlayerDomainService,
    NotifyDomainService,
    RemoteDomainService,
    RemoteDomainService,
    SwitchDomainService,
  ],
  ...[
    DeviceService,
    HACallService,
    HomeAssistantFetchAPIService,
    HASocketAPIService,
    EntityManagerService,
    TriggerService,
  ],
];

@LibraryModule({
  configuration: {
    [BASE_URL]: {
      default: 'http://localhost:8123',
      description: 'Url to reach Home Assistant at',
      required: true,
      type: 'url',
    },
    [CRASH_REQUESTS_PER_SEC]: {
      default: 500,
      description:
        'Socket service will commit sudoku if more than this many outgoing messages are sent to Home Assistant in a second. Usually indicates accidental infinite loops.',
      type: 'number',
    },
    [RENDER_TIMEOUT]: {
      default: 3,
      description:
        'Max time to wait for template rendering via Home Assistant. This value is used by HA, not the controller.',
      type: 'number',
    },
    [RETRY_INTERVAL]: {
      default: 5000,
      description: 'How often to retry connecting on connection failure (ms).',
      type: 'number',
    },
    [TOKEN]: {
      description: 'Long lived access token to Home Assistant.',
      required: true,
      type: 'password',
    },
    [WARN_REQUESTS_PER_SEC]: {
      default: 300,
      description:
        'Emit warnings if the home controller attempts to send more than X messages to Home Assistant inside of a second.',
      type: 'number',
    },
    [WEBSOCKET_URL]: {
      careful: true,
      description: `Override calculated value if it's breaking or you want something custom. Make sure to use "ws[s]://" scheme.`,
      type: 'string',
    },
  },
  exports: services,
  library: LIB_HOME_ASSISTANT,
  providers: services,
})
export class HomeAssistantModule {}
