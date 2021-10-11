import { LIB_HOME_ASSISTANT } from '@automagical/utilities';
import { LibraryModule } from '@automagical/utilities';
import { Provider } from '@nestjs/common';

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
  exports: services,
  library: LIB_HOME_ASSISTANT,
  providers: services,
})
export class HomeAssistantModule {}
