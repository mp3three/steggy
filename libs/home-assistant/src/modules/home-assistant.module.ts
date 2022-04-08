import { LibraryModule } from '@steggy/boilerplate';
import { Provider } from '@nestjs/common';

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
  ],
];

@LibraryModule({
  configuration: {
    [BASE_URL]: {
      default: 'http://localhost:8123',
      description: 'Url to reach Home Assistant at',
      type: 'url',
    },
    [CRASH_REQUESTS_PER_SEC]: {
      default: 500,
      description:
        'Socket service will self-terminate the process if this limit is exceeded',
      type: 'number',
    },
    [RENDER_TIMEOUT]: {
      default: 3,
      description: 'Max time for template rendering',
      type: 'number',
    },
    [RETRY_INTERVAL]: {
      default: 5000,
      description: 'How often to retry connecting on connection failure',
      type: 'number',
    },
    [TOKEN]: {
      description: 'Auth token to access Home Assistant',
      required: true,
      type: 'password',
    },
    [WARN_REQUESTS_PER_SEC]: {
      default: 300,
      description:
        'Emit warnings if the home controller attempts to send more than X messages to Home Assistant inside of a second',
      type: 'number',
    },
    [WEBSOCKET_URL]: {
      careful: true,
      description:
        "Override calculated value if it's breaking or you want something custom. Make sure to use ws[s]://",
      type: 'string',
    },
  },
  exports: services,
  library: LIB_HOME_ASSISTANT,
  providers: services,
})
export class HomeAssistantModule {}
